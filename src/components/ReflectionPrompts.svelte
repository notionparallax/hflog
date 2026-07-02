<script>
  let { state, questions } = $props();
</script>

{#if questions.length > 0}
<section class="card reflection-card">
  <h2>Reflection Prompts</h2>
  <p class="section-hint">
    Your scores suggest it may be worth pausing to reflect.
    Responses are optional but will be captured in the output block.
  </p>

  {#each questions as q, i}
    {#if state.reflections[i] !== undefined}
      <div class="reflection-item">
        <label class="reflection-q" for="refl_{i}">{q}</label>
        <textarea id="refl_{i}" rows="2" placeholder="Your response (optional)..."
          bind:value={state.reflections[i].a}></textarea>
      </div>
    {/if}
  {/each}
</section>
{/if}
