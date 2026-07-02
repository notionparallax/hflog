import { describe, it, expect } from 'vitest';
import { serialize, parse, deriveClassification } from '../src/lib/serialize.js';

const BASE = {
  report_id: 'test-uuid-1234',
  had_event: false,
  imsafee: { illness: 1, medication: 1, stress: 1, alcohol: 1, fatigue: 2, eating: 1, emotion: 1 },
  site_familiarity: 'return', buddy_familiarity: 'regular', time_pressure: 1,
  new_kit: false, new_kit_description: '', events: [], factors: [], learning_note: '', reflections: [],
};
const WITH_EVENTS = {
  ...BASE, had_event: true,
  events: [
    { id: 'e1', event_type: 'lost_guideline', event_description: 'Lost the primary', potential_severity: 4, proximity_barriers_remaining: 3, outcome: 'no_harm_near_miss' },
    { id: 'e2', event_type: 'silt_out', event_description: 'Reduced visibility', potential_severity: 2, proximity_barriers_remaining: 1, outcome: 'no_harm_near_miss' },
  ],
  factors: ['awareness', 'complacency'], learning_note: 'Rushed the tie-off.',
  reflections: [{ q: 'What was the status of your primary tie-off?', a: 'Not fully set' }],
};
describe('deriveClassification', () => {
  it('nil when no event', () => expect(deriveClassification(false, [])).toBe('nil'));
  it('near_miss for all no_harm', () => expect(deriveClassification(true, WITH_EVENTS.events)).toBe('near_miss'));
  it('incident when any event has harm', () => expect(deriveClassification(true, [{outcome:'no_harm_near_miss'},{outcome:'minor_injury'}])).toBe('incident'));
});
describe('serialize', () => {
  it('sentinel bounds', () => { expect(serialize(BASE)).toMatch(/^\[DIVE-HF v1\]/); expect(serialize(BASE)).toContain('[/DIVE-HF]'); });
  it('no identity fields', () => { ['contact_detail','contactable','follow_up_requested','reporter_id'].forEach(f => expect(serialize(WITH_EVENTS)).not.toContain(f)); });
  it('omits events when had_event false', () => { expect(serialize(BASE)).not.toContain('event_count'); });
  it('numbered multi-event keys', () => { const b = serialize(WITH_EVENTS); expect(b).toContain('event_count: 2'); expect(b).toContain('event_1_type: lost_guideline'); expect(b).toContain('event_2_type: silt_out'); });
  it('severity and proximity are separate fields', () => { const ls = serialize(WITH_EVENTS).split('\n'); expect(ls.filter(l=>l.startsWith('event_1_severity:'))).toHaveLength(1); expect(ls.filter(l=>l.startsWith('event_1_proximity:'))).toHaveLength(1); });
});
describe('round-trip', () => {
  it('nil-event', () => { const r = parse(serialize(BASE)); expect(r.dict.had_event).toBe(false); expect(r.dict.imsafee.fatigue).toBe(2); expect(r.dict.classification).toBe('nil'); });
  it('multi-event', () => { const r = parse(serialize(WITH_EVENTS)); expect(r.dict.classification).toBe('near_miss'); expect(r.dict.events).toHaveLength(2); expect(r.dict.events[0].type).toBe('lost_guideline'); expect(r.dict.events[0].severity).toBe(4); });
  it('preserves free text', () => { const r = parse('Before.\n' + serialize(BASE) + '\nAfter.'); expect(r.before.trim()).toBe('Before.'); expect(r.after.trim()).toBe('After.'); });
  it('preserves reflections', () => { expect(parse(serialize(WITH_EVENTS)).dict.reflections[0].a).toBe('Not fully set'); });
  it('double-quotes in text', () => { const s = {...WITH_EVENTS, events: [{...WITH_EVENTS.events[0], event_description: 'He said "watch out!"'}]}; expect(parse(serialize(s)).dict.events[0].description).toBe('He said "watch out!"'); });
});
describe('parse edge cases', () => {
  it('null with no block', () => expect(parse('Notes.')).toBeNull());
  it('null with missing close sentinel', () => expect(parse('[DIVE-HF v1]\nhad_event: false')).toBeNull());
  it('no throw on unknown version', () => expect(()=>parse('[DIVE-HF v99]\nhad_event: false\n[/DIVE-HF]')).not.toThrow());
});