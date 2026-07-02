<script>
  import { FACTORS } from '../lib/vocab.js';
  let { state } = $props();

  function toggleFactor(value) {
    if (state.factors.includes(value)) {
      state.factors = state.factors.filter(f => f !== value);
    } else {
      state.factors = [...state.factors, value];
    }
  }
</script>

<section class="card">
  <h2>Human Factors</h2>
  <p class="section-hint">Select all contributing factors. Optional for nil-event dives.</p>

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
    <textarea id="learning" rows="3"
      placeholder="What would you do differently? Any systemic factor worth noting?"
      bind:value={state.learning_note}></textarea>
  </div>
</section>
