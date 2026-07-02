<script>
  import { untrack } from 'svelte';
  import { getSuggestedQuestions } from './lib/vocab.js';
  import { serialize } from './lib/serialize.js';
  import PreDiveState from './components/PreDiveState.svelte';
  import EventSection from './components/EventSection.svelte';
  import HumanFactors from './components/HumanFactors.svelte';
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
      new_kit: false,
      new_kit_description: '',
      events: [],
      factors: [],
      learning_note: '',
      reflections: [],
    };
  }

  let state = $state(emptyState());

  let suggestedQuestions = $derived(getSuggestedQuestions(state));

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
</script>

<main class="app-main">
  <div class="page-title">
    <div>
      <h1>Human Factors Log</h1>
      <p class="page-subtitle">Confidential post-dive safety logging</p>
    </div>
    <button type="button" class="btn-new" onclick={reset}>New Report</button>
  </div>

  <PreDiveState {state} />
  <EventSection {state} {newEvent} />
  <HumanFactors {state} />
  <ReflectionPrompts {state} questions={suggestedQuestions} />
  <OutputBlock {blockString} />
</main>
