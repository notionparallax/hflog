<script>
  import { EVENT_TYPES, SEVERITY_ANCHORS, PROXIMITY_ANCHORS, OUTCOMES } from '../lib/vocab.js';
  let { event, index, total, onremove } = $props();
</script>

<div class="event-item" class:event-item-divider={index > 0}>
  <div class="event-item-head">
    <span class="event-item-label">
      {total > 1 ? `Event ${index + 1}` : 'Event'}
    </span>
    {#if total > 1}
      <button type="button" class="remove-event-btn" onclick={onremove}>Remove</button>
    {/if}
  </div>

  <div class="pair-row">
    <div class="field-row">
      <label>Type</label>
      <select bind:value={event.event_type}>
        <option value="">— select —</option>
        {#each EVENT_TYPES as t}
          <option value={t.value}>{t.label}</option>
        {/each}
      </select>
    </div>
    <div class="field-row">
      <label>Outcome</label>
      <select bind:value={event.outcome}>
        <option value="">— select —</option>
        {#each OUTCOMES as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="imsafee-fields event-scales">
    <div class="imsafee-field">
      <span class="field-label event-scale-label">Severity</span>
      <input
        type="range" min="1" max="5" step="1"
        value={event.potential_severity}
        oninput={(e) => { event.potential_severity = +e.target.value; }}
        class:warn={event.potential_severity >= 4}
      />
      <span class="current-val" class:warn={event.potential_severity >= 4}>{event.potential_severity}</span>
      <span class="anchor-inline" class:warn={event.potential_severity >= 4}>{SEVERITY_ANCHORS[event.potential_severity]}</span>
    </div>
    <div class="imsafee-field">
      <span class="field-label event-scale-label">Proximity</span>
      <input
        type="range" min="1" max="5" step="1"
        value={event.proximity_barriers_remaining}
        oninput={(e) => { event.proximity_barriers_remaining = +e.target.value; }}
        class:warn={event.proximity_barriers_remaining >= 4}
      />
      <span class="current-val" class:warn={event.proximity_barriers_remaining >= 4}>{event.proximity_barriers_remaining}</span>
      <span class="anchor-inline" class:warn={event.proximity_barriers_remaining >= 4}>{PROXIMITY_ANCHORS[event.proximity_barriers_remaining]}</span>
    </div>
  </div>

  <div class="field-row">
    <label>Description</label>
    <textarea rows="2" placeholder="Briefly describe what happened..." bind:value={event.event_description}></textarea>
  </div>
</div>
