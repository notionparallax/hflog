<script>
  import { FACTORS } from '../lib/vocab.js';
  import EventItem from './EventItem.svelte';

  let { state, newEvent } = $props();

  function addEvent() {
    state.events = [...state.events, newEvent()];
  }

  function removeEvent(idx) {
    state.events = state.events.filter((_, i) => i !== idx);
  }

  function toggleFactor(value) {
    if (state.factors.includes(value)) {
      state.factors = state.factors.filter(f => f !== value);
    } else {
      state.factors = [...state.factors, value];
    }
  }
</script>

<section class="card event-card">
  <div class="event-header">
    <h2>
      Events / Near Misses
      <button type="button" class="tooltip-wrap">?
        <span class="tooltip-box">
          Event logging uses the DAN DIRS taxonomy (Diving Incident Reporting System)
          — a standardised vocabulary that lets data pool with national and international
          datasets in future.
          <br /><br />
          Each event is rated on two independent axes so a single dive with multiple events
          — each with a different risk profile — can be recorded accurately. Never collapse two separate events into one score.
          <br /><br />
          <strong>Severity</strong> — how bad could the outcome have been?<br />
          <strong>Proximity</strong> — how close did it actually come?
        </span>
      </button>
    </h2>
  </div>

  {#each state.events as event, i (event.id)}
    <EventItem
      {event}
      index={i}
      total={state.events.length}
      onremove={() => removeEvent(i)}
    />
  {/each}

  <button type="button" class="add-event-btn" onclick={addEvent}>
    + Log an event
  </button>

  <div class="what-went-well">
    <label for="what_went_well">What went well?</label>
    <p class="field-hint">What skills, behaviours, or planning choices protected this dive's outcome?</p>
    <textarea id="what_went_well" rows="2"
      placeholder="e.g. clear pre-dive brief, gas management, team communication..."
      bind:value={state.what_went_well}></textarea>
  </div>

  {#if state.events.length > 0}
    <div class="event-factors">
      <h3>Contributing factors <span class="factors-subhead">across this dive's events</span></h3>
      <div class="factors-grid">
        {#each FACTORS as factor}
          <button type="button" class="factor-chip" class:active={state.factors.includes(factor.value)}
            onclick={() => toggleFactor(factor.value)}>
            {factor.label}
          </button>
        {/each}
      </div>
      <div class="field-row">
        <label for="learning">Learning note</label>
        <textarea id="learning" rows="2"
          placeholder="What would you change about your own decision-making? What would you change about the system, environment, or training that made this more likely?"
          bind:value={state.learning_note}></textarea>
      </div>
    </div>
  {/if}
</section>
