<script>
  import { untrack } from 'svelte';
  import { getSuggestedQuestions } from './lib/vocab.js';
  import { serialize, parse } from './lib/serialize.js';
  import PreDiveState from './components/PreDiveState.svelte';
  import EventSection from './components/EventSection.svelte';
  import ReflectionPrompts from './components/ReflectionPrompts.svelte';
  import OutputBlock from './components/OutputBlock.svelte';

  function newEvent() {
    return { id: crypto.randomUUID(), event_type: '', event_description: '', potential_severity: 1, proximity_barriers_remaining: 1, outcome: '' };
  }

  function emptyState() {
    return {
      report_id: crypto.randomUUID(),
      imsafee: { illness: 1, medication: 1, stress: 1, alcohol: 1, fatigue: 1, eating: 1, emotion: 1 },
      site_familiarity: '',
      buddy_familiarity: '',
      time_pressure: 1,
      brief_quality: 1,
      task_complexity: 1,
      plan_adherence: 1,
      new_kit: false,
      new_kit_description: '',
      events: [],
      factors: [],
      learning_note: '',
      what_went_well: '',
      reflections: [],
    };
  }

  let state = $state(emptyState());

  let suggestedQuestions = $derived(getSuggestedQuestions({
    imsafee: state.imsafee,
    events: state.events,
    factors: state.factors,
  }));

  $effect(() => {
    const qs = suggestedQuestions;
    state.reflections = qs.map(q => ({
      q,
      a: untrack(() => state.reflections.find(r => r.q === q)?.a ?? ''),
    }));
  });

  let blockString = $derived(serialize(state));

  function reset() {
    const s = emptyState();
    Object.assign(state, s);
    state.imsafee = { ...s.imsafee };
    state.events = [];
    state.factors = [];
    state.reflections = [];
  }

  function loadFromBlock(dict) {
    if (dict.report_id) state.report_id = dict.report_id;

    if (dict.imsafee) {
      state.imsafee = {
        illness:    +dict.imsafee.illness    || 1,
        medication: +dict.imsafee.medication || 1,
        stress:     +dict.imsafee.stress     || 1,
        alcohol:    +dict.imsafee.alcohol    || 1,
        fatigue:    +dict.imsafee.fatigue    || 1,
        eating:     +dict.imsafee.eating     || 1,
        emotion:    +dict.imsafee.emotion    || 1,
      };
    }

    state.site_familiarity  = dict.site_familiarity  || '';
    state.buddy_familiarity = dict.buddy_familiarity || '';
    state.brief_quality     = +dict.brief_quality     || 1;
    state.time_pressure     = +dict.time_pressure     || 1;
    state.task_complexity   = +dict.task_complexity   || 1;
    state.plan_adherence    = +dict.plan_adherence    || 1;

    if (dict.new_kit === false) {
      state.new_kit = false;
      state.new_kit_description = '';
    } else if (typeof dict.new_kit === 'string' && dict.new_kit) {
      state.new_kit = true;
      state.new_kit_description = dict.new_kit;
    } else {
      state.new_kit = false;
      state.new_kit_description = '';
    }

    state.events = dict.events?.length > 0
      ? dict.events.map(ev => ({
          id: crypto.randomUUID(),
          event_type:                   ev.type        || '',
          event_description:            ev.description || '',
          potential_severity:           +ev.severity   || 1,
          proximity_barriers_remaining: +ev.proximity  || 1,
          outcome:                      ev.outcome     || '',
        }))
      : [];

    state.factors        = Array.isArray(dict.factors) ? dict.factors : [];
    state.learning_note  = dict.learning        || '';
    state.what_went_well = dict.what_went_well  || '';
    state.reflections    = dict.reflections?.map(r => ({ q: r.q || '', a: r.a || '' })) ?? [];
  }
</script>

<main class="app-main">
  <div class="page-title">
    <h1>Human Factors Log</h1>
    <p class="page-subtitle">Confidential post-dive safety logging. Normalising the discussion of deviance.</p>
  </div>

  <PreDiveState {state} />
  <EventSection {state} {newEvent} />
  <ReflectionPrompts {state} questions={suggestedQuestions} />
  <OutputBlock {blockString} onload={loadFromBlock} />
</main>
