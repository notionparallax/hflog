<script>
  import { DIVE_TYPES } from '../lib/vocab.js';
  let { state } = $props();
</script>

<section class="card">
  <h2>Dive Details</h2>

  <div class="pair-row">
    <div class="field-row">
      <label for="dive_date">Date</label>
      <input id="dive_date" type="date" bind:value={state.dive_date} />
    </div>
    <div class="field-row">
      <label for="dive_type">Type</label>
      <select id="dive_type" bind:value={state.dive_type}>
        <option value="">— select —</option>
        {#each DIVE_TYPES as t}
          <option value={t.value}>{t.label}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="field-row">
    <label for="dive_site">Site</label>
    <input id="dive_site" type="text" placeholder="e.g. Cathedral Cave, Olwolgin" bind:value={state.dive_site} />
  </div>

  <div class="pair-row">
    <div class="field-row">
      <label for="max_depth">Max depth (m)</label>
      <input id="max_depth" type="number" min="0" max="350" step="0.5" bind:value={state.max_depth_m} />
    </div>
    <div class="field-row">
      <label for="runtime">Runtime (min)</label>
      <input id="runtime" type="number" min="0" max="600" bind:value={state.runtime_min} />
    </div>
  </div>

  <div class="had-event-row">
    <label class="checkbox-label">
      <input type="checkbox" bind:checked={state.had_event} />
      <span>An event occurred on this dive</span>
    </label>
    {#if !state.had_event}
      <p class="nil-note">No event — this logs a nil-event denominator record. Complete the remaining sections at any level of detail.</p>
    {/if}
  </div>
</section>
