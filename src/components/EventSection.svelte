<script>
  import { deriveClassification } from '../lib/serialize.js';
  import EventItem from './EventItem.svelte';

  let { state, newEvent } = $props();

  function addEvent() {
    state.events = [...state.events, newEvent()];
  }

  function removeEvent(idx) {
    state.events = state.events.filter((_, i) => i !== idx);
  }
</script>

<section class="card event-card">
  <div class="event-header">
    <h2>
      Events / Near Misses
      <span class="tooltip-wrap" tabindex="0">
        ?
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
      </span>
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
</section>
