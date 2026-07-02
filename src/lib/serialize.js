// serialize.js — CDAA-HF block serializer and parser.
// Block lives inside Subsurface Notes: [CDAA-HF v1] ... [/CDAA-HF]
// Identity fields are never written here (hard boundary, not a filter).

const SCHEMA_VERSION = 1;
const SENTINEL_CLOSE = '[/DIVE-HF]';

/**
 * Derive classification from had_event and an array of event objects.
 * Worst outcome wins: incident > near_miss > nil.
 */
export function deriveClassification(hadEvent, events) {
  if (!hadEvent || !events?.length) return 'nil';
  if (events.some(e => e.outcome && e.outcome !== 'no_harm_near_miss')) return 'incident';
  if (events.some(e => e.outcome === 'no_harm_near_miss')) return 'near_miss';
  return 'near_miss'; // had_event true but outcomes not yet selected
}

function escapeLine(str) {
  return String(str ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, ' ');
}

/**
 * Serialize form state to a CDAA-HF block string.
 */
export function serialize(state) {
  const lines = [];
  const had_event = state.events?.length > 0;
  lines.push(`[DIVE-HF v${SCHEMA_VERSION}]`);
  lines.push(`report_id: ${state.report_id}`);
  lines.push(`had_event: ${had_event}`);

  const im = state.imsafee;
  lines.push(
    `imsafee: {illness: ${im.illness}, medication: ${im.medication}, stress: ${im.stress}, ` +
    `alcohol: ${im.alcohol}, fatigue: ${im.fatigue}, eating: ${im.eating}, emotion: ${im.emotion}}`
  );

  lines.push(`site_familiarity: ${state.site_familiarity ?? ''}`);
  lines.push(`buddy_familiarity: ${state.buddy_familiarity ?? ''}`);
  lines.push(`time_pressure: ${state.time_pressure}`);
  lines.push(state.new_kit ? `new_kit: "${escapeLine(state.new_kit_description)}"` : `new_kit: false`);

  if (had_event && state.events?.length > 0) {
    lines.push(`event_count: ${state.events.length}`);
    state.events.forEach((ev, i) => {
      const n = i + 1;
      lines.push(`event_${n}_type: ${ev.event_type || ''}`);
      if (ev.event_description) lines.push(`event_${n}_description: "${escapeLine(ev.event_description)}"`);
      lines.push(`event_${n}_severity: ${ev.potential_severity}`);
      lines.push(`event_${n}_proximity: ${ev.proximity_barriers_remaining}`);
      lines.push(`event_${n}_outcome: ${ev.outcome || ''}`);
    });
  }

  lines.push(`classification: ${deriveClassification(had_event, state.events)}`);

  if (state.factors?.length > 0) lines.push(`factors: [${state.factors.join(', ')}]`);
  if (state.learning_note) lines.push(`learning: "${escapeLine(state.learning_note)}"`);

  state.reflections?.forEach((r, i) => {
    lines.push(`reflection_${i + 1}_q: "${escapeLine(r.q)}"`);
    if (r.a) lines.push(`reflection_${i + 1}_a: "${escapeLine(r.a)}"`);
  });

  lines.push(SENTINEL_CLOSE);
  return lines.join('\n');
}

/**
 * Extract and parse a CDAA-HF block from notes text.
 * Returns { dict, before, after, version } or null if no block found.
 * Warns (never throws) on unknown schema version.
 */
export function parse(notes) {
  const openRe = /\[DIVE-HF v(\d+)\]/;
  const openMatch = notes.match(openRe);
  if (!openMatch) return null;

  const closeIdx = notes.indexOf(SENTINEL_CLOSE);
  if (closeIdx === -1) return null;

  const version = parseInt(openMatch[1], 10);
  if (version !== SCHEMA_VERSION) {
    console.warn(`[CDAA-HF] Unknown schema version ${version}; parsing may be incomplete.`);
  }

  const openIdx = notes.indexOf(openMatch[0]);
  const before = notes.slice(0, openIdx);
  const after = notes.slice(closeIdx + SENTINEL_CLOSE.length);
  const body = notes.slice(openIdx + openMatch[0].length, closeIdx);

  return { dict: parseBody(body), before, after, version };
}

function parseBody(body) {
  const result = {};
  const reflections = [];
  const eventsMap = {}; // idx → partial event object

  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (!line) continue;

    const ci = line.indexOf(':');
    if (ci === -1) continue;

    const key = line.slice(0, ci).trim();
    const rawVal = line.slice(ci + 1).trim();

    // Numbered event fields: event_N_field
    const evMatch = key.match(/^event_(\d+)_(\w+)$/);
    if (evMatch) {
      const idx = parseInt(evMatch[1], 10) - 1;
      const field = evMatch[2];
      if (!eventsMap[idx]) eventsMap[idx] = {};
      eventsMap[idx][field] = parseValue(rawVal);
      continue;
    }

    // Reflection Q&A pairs
    const reflMatch = key.match(/^reflection_(\d+)_([qa])$/);
    if (reflMatch) {
      const idx = parseInt(reflMatch[1], 10) - 1;
      if (!reflections[idx]) reflections[idx] = { q: '', a: '' };
      reflections[idx][reflMatch[2]] = unquote(rawVal);
      continue;
    }

    result[key] = parseValue(rawVal);
  }

  // Assemble events array (new format)
  const evKeys = Object.keys(eventsMap).sort((a, b) => a - b);
  if (evKeys.length > 0) {
    result.events = evKeys.map(k => eventsMap[k]);
  } else if (result.event_type) {
    // Backward-compat: old single-event flat format
    result.events = [{
      type: result.event_type,
      description: result.event_description,
      severity: result.severity,
      proximity: result.proximity,
      outcome: result.outcome,
    }];
  }

  if (reflections.length > 0) result.reflections = reflections;
  return result;
}

function parseValue(raw) {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw.startsWith('"') && raw.endsWith('"') && raw.length >= 2) return unescapeStr(raw.slice(1, -1));
  if (raw.startsWith('{') && raw.endsWith('}')) return parseInlineObj(raw.slice(1, -1));
  if (raw.startsWith('[') && raw.endsWith(']')) {
    const inner = raw.slice(1, -1).trim();
    return inner ? inner.split(',').map(s => s.trim()).filter(Boolean) : [];
  }
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  return raw;
}

function parseInlineObj(inner) {
  const obj = {};
  for (const part of inner.split(',')) {
    const ci = part.indexOf(':');
    if (ci === -1) continue;
    obj[part.slice(0, ci).trim()] = parseValue(part.slice(ci + 1).trim());
  }
  return obj;
}

function unquote(str) {
  return (str.startsWith('"') && str.endsWith('"') && str.length >= 2)
    ? unescapeStr(str.slice(1, -1))
    : str;
}

function unescapeStr(s) {
  return s.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}
