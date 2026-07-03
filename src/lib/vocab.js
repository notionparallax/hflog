// vocab.js — all controlled vocabularies, anchor text, and reflection prompts.
// Everything that will change as CDAA refines the taxonomy lives here.

export const DIVE_TYPES = [
    { value: 'cave', label: 'Cave' },
    { value: 'cavern', label: 'Cavern' },
    { value: 'sinkhole', label: 'Sinkhole' },
    { value: 'open_water', label: 'Open Water' },
    { value: 'training', label: 'Training' },
    { value: 'other', label: 'Other' },
];

// ─── IMSAFEE ──────────────────────────────────────────────────────────────────
// Extended from aviation IMSAFE with a second E for Emotion.
// All fields use a 1–5 scale for consistency with the severity/proximity axes.
// anchors[0] is null (1-indexed); anchors[n] is the text for value n.

export const IMSAFEE_FIELDS = [
    {
        key: 'illness',
        label: 'Illness',
        description: 'Am I suffering from any illness, injury, or ongoing symptoms?',
        anchors: [
            null,
            'No symptoms — feeling well',
            'Minor symptoms — no performance concern',
            'Noticeable symptoms — monitoring required',
            'Significant symptoms — dive readiness questionable',
            'Clearly unwell',
        ],
    },
    {
        key: 'medication',
        label: 'Medication',
        description: 'Am I taking any medication that could affect my performance or judgement?',
        anchors: [
            null,
            'Taking no medication',
            'Medication with no expected cognitive effect',
            'Medication with possible mild effect — note the type',
            'Medication with known performance impact',
            'Acutely medicated — impairment expected',
        ],
    },
    {
        key: 'stress',
        label: 'Stress',
        description: 'Am I under psychological pressure from any source?',
        anchors: [
            null,
            'Calm — no stressors',
            'Mild background stress, easily managed',
            'Noticeable stress — present but manageable',
            'High stress affecting concentration',
            'Overwhelmed — significant performance impairment',
        ],
    },
    {
        key: 'alcohol',
        label: 'Alcohol',
        description: 'Have I consumed alcohol recently?',
        anchors: [
            null,
            'None in the past 72+ hours',
            'Light consumption >24 h ago — no residual effect',
            'Residually affected — "dusty"',
            'Consumed within the past 8 hours',
            'Currently or very recently drinking',
        ],
    },
    {
        key: 'fatigue',
        label: 'Fatigue',
        description: 'How rested am I?',
        anchors: [
            null,
            'Well-rested',
            'Slightly tired but sharp',
            'Noticeably tired — some effort required to focus',
            'Fatigued — attention patchy',
            'Exhausted — concentration severely impaired',
        ],
    },
    {
        key: 'eating',
        label: 'Eating / Hydration',
        description: 'Have I eaten and hydrated adequately for this dive?',
        anchors: [
            null,
            'Well-fed and well-hydrated',
            'Minor hunger or thirst — not concerning',
            'Noticeably hungry or low on fluids',
            'Significantly under-fuelled or dehydrated',
            'Not eaten, or severely dehydrated',
        ],
    },
    {
        key: 'emotion',
        label: 'Emotion',
        description: 'Is my emotional state fully compatible with safe diving?',
        anchors: [
            null,
            'Positive, engaged, clear-headed',
            'Minor emotional noise — not a concern',
            'Emotional undercurrent — present but contained',
            'Significantly distracted by emotional state',
            'Emotionally overwhelmed — not in the right headspace',
        ],
    },
];

export const TIME_PRESSURE_ANCHORS = [
    null,
    'No time pressure',
    'Mild preference for efficiency',
    'Noticeable constraint affecting planning',
    'Significant pressure influencing dive decisions',
    'Strong external pressure to complete or continue the dive',
];

export const BRIEF_QUALITY_ANCHORS = [
  null,
  'No brief — straight in',
  'Quick verbal exchange',
  'Standard briefing (plan, gas, limits, signals)',
  'Thorough brief with contingencies discussed',
  'Full written plan, all contingencies, everyone confirmed understanding',
];

export const TASK_COMPLEXITY_ANCHORS = [
  null,
  'Completely routine — well within comfort zone',
  'Comfortable, minor novel elements',
  'Moderately challenging',
  'Significantly challenging — near task saturation',
  'At or beyond my limits for this dive',
];

export const PLAN_ADHERENCE_ANCHORS = [
  null,
  'Followed the plan exactly',
  'Minor deviations, all within parameters',
  'Notable unplanned deviations',
  'Significant departure from the plan',
  'Substantially different from planned dive',
];

export const SITE_FAMILIARITY = [
  { value: 'first_time', label: 'First time' },
  { value: 'return',     label: 'Return visit' },
  { value: 'regular',    label: 'Regular — very familiar' },
];

export const BUDDY_FAMILIARITY = [
    { value: 'solo', label: 'Solo' },
    { value: 'stranger', label: 'Stranger' },
    { value: 'occasional', label: 'Occasional buddy' },
    { value: 'regular', label: 'Regular buddy' },
];

// ─── Event ────────────────────────────────────────────────────────────────────
// Aligned to DAN DIRS categories for future data pooling.

export const EVENT_TYPES = [
    { value: 'rapid_ascent', label: 'Rapid ascent' },
    { value: 'out_of_gas', label: 'Out of gas' },
    { value: 'buoyancy_loss', label: 'Buoyancy loss' },
    { value: 'valve_not_fully_open', label: 'Valve not fully open' },
    { value: 'entanglement', label: 'Entanglement' },
    { value: 'lost_guideline', label: 'Lost guideline' },
    { value: 'silt_out', label: 'Silt out' },
    { value: 'light_failure', label: 'Light failure' },
    { value: 'gas_switch_error', label: 'Gas switch error' },
    { value: 'dcs_symptom', label: 'DCS symptom' },
    { value: 'equipment_failure', label: 'Equipment failure' },
    { value: 'buddy_separation', label: 'Buddy separation' },
    { value: 'navigation_error', label: 'Navigation error' },
    { value: 'other', label: 'Other' },
];

// Axis A: how bad could the outcome have been?
export const SEVERITY_ANCHORS = [
    null,
    'Trivial — comfort or annoyance only',
    'Minor — recoverable discomfort, no plausible injury',
    'Moderate — plausible minor injury or aborted dive',
    'Serious — plausible serious injury, DCS, or emergency ascent',
    'Catastrophic — plausible fatality',
];

// Axis B: how close did it actually come?
export const PROXIMITY_ANCHORS = [
    null,
    'Many barriers remained; caught early, ample margin',
    'Comfortable margin; resolved routinely',
    'Noticeable erosion; one or two barriers left',
    'Last effective barrier; narrowly avoided',
    'Essentially only luck or circumstance prevented the outcome',
];

export const OUTCOMES = [
    { value: 'no_harm_near_miss', label: 'No harm — near miss' },
    { value: 'minor_injury', label: 'Minor injury' },
    { value: 'treatment_required', label: 'Treatment required' },
    { value: 'evacuation', label: 'Evacuation' },
    { value: 'fatality', label: 'Fatality' },
];

// ─── Human factors — Dirty Dozen ─────────────────────────────────────────────

export const FACTORS = [
    { value: 'communication', label: 'Communication' },
    { value: 'complacency', label: 'Complacency' },
    { value: 'knowledge', label: 'Knowledge' },
    { value: 'distraction', label: 'Distraction' },
    { value: 'teamwork', label: 'Teamwork' },
    { value: 'fatigue', label: 'Fatigue' },
    { value: 'resources', label: 'Resources' },
    { value: 'pressure', label: 'Pressure' },
    { value: 'assertiveness', label: 'Assertiveness' },
    { value: 'stress', label: 'Stress' },
    { value: 'awareness', label: 'Awareness' },
    { value: 'norms', label: 'Norms' }, { value: 'cold', label: 'Cold' },];

// ─── Reflection prompts ───────────────────────────────────────────────────────
// AI augmentation hook: replace getSuggestedQuestions() with a function that
// calls an API and returns question strings — the rest of the app is unchanged.

const REFLECTION_PROMPTS = {
    imsafee_high: [
        'You flagged pre-dive concerns. How did you weigh them against the decision to dive?',
        'Was there external or self-imposed pressure influencing your go / no-go decision?',
        'What would have made you feel more ready for this dive?',
    ],
    event_high_severity: [
        'Walk through the sequence of events from the first sign to resolution.',
        'At what point did the situation become serious, and what changed?',
        'What barriers were in place, and which ones held?',
    ],
    event_high_proximity: [
        'What was the last thing that prevented this from becoming worse?',
        'Was the resolution planned, or did it happen by chance?',
        'What would you change to add more margins next time?',
    ],
    event_type: {
        rapid_ascent: ['What caused the uncontrolled ascent rate?', 'How did you manage the situation once you recognised it?'],
        out_of_gas: ['Walk through your gas planning and what diverged from it.', 'Was the gas state communicated to your team before the problem?'],
        buoyancy_loss: ['What changed in your buoyancy setup, and when did you first notice it?'],
        valve_not_fully_open: ['How was the kit check conducted, and who checked the valves?'],
        entanglement: ['What entanglement risk were you aware of before the dive?'],
        lost_guideline: ['What was the status of your primary tie-off and safety reel?', 'Were you tracking your position mentally? When did you lose that picture?'],
        silt_out: ['What contributed to the visibility loss, and how did you navigate it?'],
        light_failure: ['What was your lighting configuration, and what was your contingency?'],
        gas_switch_error: ['What was the switching protocol, and where did it break down?'],
        dcs_symptom: ['Walk through your decompression obligations and how they were managed.'],
        equipment_failure: ['Was this a known item, and had it been serviced recently?'],
        buddy_separation: ['What was your team protocol for separation, and was it briefed?'],
        navigation_error: ['What navigation reference did you lose track of, and when?'],
        other: ['Describe what happened and what you believe caused it.'],
    },
    factor: {
        communication: ['What communication broke down, and at what point?'],
        complacency: ['What assumptions were you making that turned out to be incorrect?'],
        knowledge: ['What information were you missing, and how did you proceed without it?'],
        distraction: ['What drew your attention away, and how did that affect the dive?'],
        teamwork: ['Was the team functioning as a unit at the point of the event?'],
        fatigue: ['How did fatigue affect your decision-making or execution on this dive?'],
        resources: ['What resource was inadequate, and how did you manage the gap?'],
        pressure: ['Where was the pressure coming from, and how did it influence your choices?'],
        assertiveness: ['Was there a moment where you had a concern but did not act on it?'],
        stress: ['How did your stress level affect your performance during the dive?'],
        awareness: ['What was your situational awareness like leading up to the event?'],
        norms: ['Was there a "this is just how we do it here" pattern at play?'], 
        cold: ['At what point did the cold start affecting your performance or judgement?'],
    },
};

/**
 * Return up to 4 contextual reflection questions based on form state.
 * Priority order: event-type → factor → severity/proximity → IMSAFEE.
 */
export function getSuggestedQuestions(state) {
    const questions = [];
    const seen = new Set();

    function add(q) {
        if (!seen.has(q) && questions.length < 4) {
            seen.add(q);
            questions.push(q);
        }
    }

    const { imsafee, events = [], factors } = state;
    const had_event = events.length > 0;

    if (had_event && events.length > 0) {
        // Use the most severe event as the primary driver for event-type prompts
        const primary = events.reduce(
            (worst, e) => ((e.potential_severity || 0) >= (worst.potential_severity || 0) ? e : worst),
            events[0]
        );

        if (primary.event_type && REFLECTION_PROMPTS.event_type[primary.event_type]) {
            REFLECTION_PROMPTS.event_type[primary.event_type].forEach(add);
        }

        if (factors?.length > 0) {
            factors.forEach(f => {
                const prompts = REFLECTION_PROMPTS.factor[f];
                if (prompts) {
                    prompts.forEach(add);
                } else {
                    add(`How did ${f} contribute to this event, and what would you do differently?`);
                }
            });
        }

        const maxSev = Math.max(...events.map(e => e.potential_severity || 1));
        const maxProx = Math.max(...events.map(e => e.proximity_barriers_remaining || 1));
        if (maxSev >= 4) REFLECTION_PROMPTS.event_high_severity.forEach(add);
        if (maxProx >= 4) REFLECTION_PROMPTS.event_high_proximity.forEach(add);
    // Unconditional systemic prompt for significant events (HFACS upstream lens)
    if (maxSev >= 3) {
      add('Was there anything about the training, equipment, environment, or dive planning that made this event more likely to occur?');
    }
        if (max >= 4 || (max >= 3 && had_event)) {
            REFLECTION_PROMPTS.imsafee_high.forEach(add);
        }
    }

    return questions;
}
