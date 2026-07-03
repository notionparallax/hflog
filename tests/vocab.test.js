import { describe, it, expect } from 'vitest';
import { getSuggestedQuestions } from '../src/lib/vocab.js';

// Helper: build a minimal state object for getSuggestedQuestions
function state({
  imsafee = { illness: 1, medication: 1, stress: 1, alcohol: 1, fatigue: 1, eating: 1, emotion: 1 },
  events = [],
  factors = [],
} = {}) {
  return { imsafee, events, factors };
}

function event({ potential_severity = 1, proximity_barriers_remaining = 1, event_type = '', outcome = '' } = {}) {
  return { id: 'e1', event_type, event_description: '', potential_severity, proximity_barriers_remaining, outcome };
}

describe('getSuggestedQuestions', () => {
  describe('nil dive — no events', () => {
    it('returns no prompts when everything is nominal', () => {
      expect(getSuggestedQuestions(state())).toHaveLength(0);
    });

    it('returns no factor prompts without events', () => {
      expect(getSuggestedQuestions(state({ factors: ['complacency'] }))).toHaveLength(0);
    });

    it('returns IMSAFEE prompts when any field ≥ 4 (even without events)', () => {
      const qs = getSuggestedQuestions(state({ imsafee: { illness: 4, medication: 1, stress: 1, alcohol: 1, fatigue: 1, eating: 1, emotion: 1 } }));
      expect(qs.length).toBeGreaterThan(0);
      expect(qs[0]).toMatch(/pre-dive concerns/i);
    });

    it('returns NO IMSAFEE prompts when max field is 3 but no events', () => {
      const qs = getSuggestedQuestions(state({ imsafee: { illness: 3, medication: 1, stress: 1, alcohol: 1, fatigue: 1, eating: 1, emotion: 1 } }));
      expect(qs).toHaveLength(0);
    });
  });

  describe('with events', () => {
    it('returns factor prompts when an event exists and a factor is selected', () => {
      const qs = getSuggestedQuestions(state({
        events: [event()],
        factors: ['complacency'],
      }));
      expect(qs.length).toBeGreaterThan(0);
      expect(qs.some(q => /assumptions/i.test(q))).toBe(true);
    });

    it('returns systemic factor prompts for training_gap, equip_design, org_pressure', () => {
      for (const f of ['training_gap', 'equip_design', 'org_pressure']) {
        const qs = getSuggestedQuestions(state({ events: [event()], factors: [f] }));
        expect(qs.length, `expected prompt for factor "${f}"`).toBeGreaterThan(0);
      }
    });

    it('returns a fallback prompt for unrecognised factors', () => {
      const qs = getSuggestedQuestions(state({ events: [event()], factors: ['some_future_factor'] }));
      expect(qs.length).toBeGreaterThan(0);
      expect(qs[0]).toMatch(/some_future_factor/i);
    });

    it('returns severity prompts when severity ≥ 4', () => {
      const qs = getSuggestedQuestions(state({ events: [event({ potential_severity: 4 })] }));
      expect(qs.some(q => /sequence of events/i.test(q))).toBe(true);
    });

    it('returns proximity prompts when proximity ≥ 4', () => {
      const qs = getSuggestedQuestions(state({ events: [event({ proximity_barriers_remaining: 4 })] }));
      expect(qs.some(q => /last thing/i.test(q))).toBe(true);
    });

    it('returns the upstream systemic prompt when severity ≥ 3', () => {
      const qs = getSuggestedQuestions(state({ events: [event({ potential_severity: 3 })] }));
      expect(qs.some(q => /training.*equipment.*environment/i.test(q))).toBe(true);
    });

    it('does NOT return the upstream systemic prompt when severity < 3', () => {
      const qs = getSuggestedQuestions(state({ events: [event({ potential_severity: 2 })] }));
      expect(qs.some(q => /training.*equipment.*environment/i.test(q))).toBe(false);
    });

    it('returns IMSAFEE prompts when max field ≥ 3 and events exist', () => {
      const qs = getSuggestedQuestions(state({
        events: [event()],
        imsafee: { illness: 3, medication: 1, stress: 1, alcohol: 1, fatigue: 1, eating: 1, emotion: 1 },
      }));
      expect(qs.some(q => /pre-dive concerns/i.test(q))).toBe(true);
    });

    it('uses most-severe event for event-type prompts', () => {
      const qs = getSuggestedQuestions(state({
        events: [
          event({ potential_severity: 1, event_type: 'silt_out' }),
          event({ potential_severity: 4, event_type: 'lost_guideline' }),
        ],
        factors: [],
      }));
      // lost_guideline is the primary (highest severity) — its prompts should appear
      expect(qs.some(q => /tie-off/i.test(q))).toBe(true);
    });

    it('caps output at 4 prompts', () => {
      // Trigger as many prompts as possible
      const qs = getSuggestedQuestions(state({
        events: [event({ potential_severity: 5, proximity_barriers_remaining: 5, event_type: 'lost_guideline' })],
        factors: ['complacency', 'pressure', 'awareness'],
        imsafee: { illness: 5, medication: 1, stress: 1, alcohol: 1, fatigue: 1, eating: 1, emotion: 1 },
      }));
      expect(qs.length).toBeLessThanOrEqual(4);
    });

    it('returns unique prompts only — no duplicates', () => {
      const qs = getSuggestedQuestions(state({
        events: [event({ potential_severity: 5, proximity_barriers_remaining: 5, event_type: 'lost_guideline' })],
        factors: ['complacency'],
      }));
      expect(new Set(qs).size).toBe(qs.length);
    });
  });
});
