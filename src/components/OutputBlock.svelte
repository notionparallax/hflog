<script>
  import { parse } from '../lib/serialize.js';
  let { blockString, onload } = $props();
  let copied = $state(false);
  let loadMode = $state(false);
  let pasteText = $state('');
  let loadError = $state('');

  async function copy() {
    try {
      await navigator.clipboard.writeText(blockString);
    } catch {
      const el = document.createElement('textarea');
      el.value = blockString;
      el.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    copied = true;
    setTimeout(() => { copied = false; }, 2000);
  }

  function openLoad() { loadMode = true; pasteText = ''; loadError = ''; }
  function cancelLoad() { loadMode = false; pasteText = ''; loadError = ''; }

  function doLoad() {
    const result = parse(pasteText.trim());
    if (!result) {
      loadError = 'No valid [DIVE-HF v1] block found — check the pasted text.';
      return;
    }
    onload(result.dict);
    cancelLoad();
  }
</script>

<section class="card output-card">
  <h2>Report Block</h2>
  <p class="section-hint">
    Copy this block and paste it into the <strong>Notes</strong> field for this dive in your dive log.
    It coexists safely with any free text already there.
  </p>

  <div class="output-actions">
    <button type="button" class="copy-btn" class:copied onclick={copy}>
      {copied ? '✓ Copied!' : 'Copy to clipboard'}
    </button>
    {#if !loadMode}
      <button type="button" class="load-toggle-btn" onclick={openLoad}>
        Load a saved block
      </button>
    {/if}
  </div>

  {#if loadMode}
    <div class="load-section">
      <label for="paste_block">Paste a saved DIVE-HF block to populate the form:</label>
      <textarea id="paste_block" rows="6"
        placeholder="[DIVE-HF v1]&#10;report_id: ...&#10;[/DIVE-HF]"
        bind:value={pasteText}></textarea>
      {#if loadError}<p class="load-error">{loadError}</p>{/if}
      <div class="load-section-actions">
        <button type="button" class="copy-btn" onclick={doLoad} disabled={!pasteText.trim()}>
          Load into form
        </button>
        <button type="button" class="load-cancel-btn" onclick={cancelLoad}>Cancel</button>
      </div>
    </div>
  {/if}

  <pre class="block-output">{blockString}</pre>
</section>