<script>
  import { IMSAFEE_FIELDS, TIME_PRESSURE_ANCHORS, BRIEF_QUALITY_ANCHORS, TASK_COMPLEXITY_ANCHORS, PLAN_ADHERENCE_ANCHORS, SITE_FAMILIARITY, BUDDY_FAMILIARITY } from '../lib/vocab.js';
  let { state } = $props();

  // $derived array ensures Svelte tracks each property access.
  // Dynamic key access like state.imsafee[field.key] inside #each
  // does not reliably register as a reactive dependency in Svelte 5.
  let imsafeeVals = $derived(IMSAFEE_FIELDS.map(f => state.imsafee[f.key]));
</script>

<section class="card">
  <h2>Pre-Dive State</h2>

  <div class="imsafee-header">
    <span class="imsafee-section-label">IMSAFEE</span>
    <button type="button" class="tooltip-wrap">?
      <span class="tooltip-box">
        IMSAFEE is an aviation pre-flight readiness check adapted for diving.
        Rate each factor 1–5 immediately before entering the water.
        <br /><br />
        <strong>I</strong>llness · <strong>M</strong>edication · <strong>S</strong>tress
        · <strong>A</strong>lcohol · <strong>F</strong>atigue · <strong>E</strong>ating
        · <strong>E</strong>motion
        <br /><br />
        Elevated scores provide pre-dive context for any events, and trigger reflection prompts.
      </span>
    </button>
  </div>
  <div class="imsafee-fields">
    {#each IMSAFEE_FIELDS as field, i}
      <div class="imsafee-field">
        <label class="field-label" for="imsafee-{field.key}">{field.label}</label>
        <input
          id="imsafee-{field.key}"
          type="range" min="1" max="5" step="1"
          value={imsafeeVals[i]}
          oninput={(e) => { state.imsafee[field.key] = +e.target.value; }}
          class:warn={imsafeeVals[i] >= 4}
        />
        <span class="current-val" class:warn={imsafeeVals[i] >= 4}>{imsafeeVals[i]}</span>
        <span class="anchor-inline" class:warn={imsafeeVals[i] >= 4}>{field.anchors[imsafeeVals[i]]}</span>
        <span class="field-question">{field.description}</span>
      </div>
    {/each}
  </div>

  <hr />

  <div class="inline-pill-row">
    <span class="inline-pill-label">Site familiarity</span>
    <div class="radio-group">
      {#each SITE_FAMILIARITY as opt}
        <label class="radio-label">
          <input type="radio" name="site_fam" value={opt.value} bind:group={state.site_familiarity} />
          {opt.label}
        </label>
      {/each}
    </div>
  </div>

  <div class="inline-pill-row">
    <span class="inline-pill-label">Buddy / team</span>
    <div class="radio-group">
      {#each BUDDY_FAMILIARITY as opt}
        <label class="radio-label">
          <input type="radio" name="buddy_fam" value={opt.value} bind:group={state.buddy_familiarity} />
          {opt.label}
        </label>
      {/each}
    </div>
  </div>

  <hr />

  <div class="imsafee-field">
    <label class="field-label" for="time_pressure">Time pressure</label>
    <input id="time_pressure"
      type="range" min="1" max="5" step="1"
      value={state.time_pressure}
      oninput={(e) => { state.time_pressure = +e.target.value; }}
      class:warn={state.time_pressure >= 4}
    />
    <span class="current-val" class:warn={state.time_pressure >= 4}>{state.time_pressure}</span>
    <span class="anchor-inline" class:warn={state.time_pressure >= 4}>{TIME_PRESSURE_ANCHORS[state.time_pressure]}</span>
    <span class="field-question">Was there pressure to dive within a specific timeframe?</span>
  </div>

  <div class="imsafee-field">
    <label class="field-label" for="brief_quality">Brief quality</label>
    <input id="brief_quality" type="range" min="1" max="5" step="1"
      value={state.brief_quality}
      oninput={(e) => { state.brief_quality = +e.target.value; }}
      class:warn={state.brief_quality >= 4}
    />
    <span class="current-val" class:warn={state.brief_quality >= 4}>{state.brief_quality}</span>
    <span class="anchor-inline" class:warn={state.brief_quality >= 4}>{BRIEF_QUALITY_ANCHORS[state.brief_quality]}</span>
    <span class="field-question">How thorough was the pre-dive brief?</span>
  </div>

  <div class="imsafee-field">
    <label class="field-label" for="task_complexity">Task complexity</label>
    <input id="task_complexity" type="range" min="1" max="5" step="1"
      value={state.task_complexity}
      oninput={(e) => { state.task_complexity = +e.target.value; }}
      class:warn={state.task_complexity >= 4}
    />
    <span class="current-val" class:warn={state.task_complexity >= 4}>{state.task_complexity}</span>
    <span class="anchor-inline" class:warn={state.task_complexity >= 4}>{TASK_COMPLEXITY_ANCHORS[state.task_complexity]}</span>
    <span class="field-question">How complex was this dive relative to your experience?</span>
  </div>

  <div class="imsafee-field">
    <label class="field-label" for="plan_adherence">Plan adherence</label>
    <input id="plan_adherence" type="range" min="1" max="5" step="1"
      value={state.plan_adherence}
      oninput={(e) => { state.plan_adherence = +e.target.value; }}
      class:warn={state.plan_adherence >= 4}
    />
    <span class="current-val" class:warn={state.plan_adherence >= 4}>{state.plan_adherence}</span>
    <span class="anchor-inline" class:warn={state.plan_adherence >= 4}>{PLAN_ADHERENCE_ANCHORS[state.plan_adherence]}</span>
    <span class="field-question">Did you dive the plan as briefed?</span>
  </div>

  <hr />

  <div class="field-row">
    <label class="checkbox-label">
      <input type="checkbox" bind:checked={state.new_kit} />
      <span>New or changed equipment on this dive</span>
    </label>
    {#if state.new_kit}
      <input type="text" class="kit-desc" placeholder="Describe what is new or changed..."
        bind:value={state.new_kit_description} />
    {/if}
  </div>
</section>