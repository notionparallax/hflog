<script>
  let { blockString } = $props();
  let copied = $state(false);

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
</script>

<section class="card output-card">
  <h2>Report Block</h2>
  <p class="section-hint">
    Copy this block and paste it into the <strong>Notes</strong> field of this dive in Subsurface.
    It coexists safely with any free text already in Notes.
  </p>
  <div class="output-actions">
    <button type="button" class="copy-btn" class:copied onclick={copy}>
      {copied ? '✓ Copied!' : 'Copy to clipboard'}
    </button>
  </div>
  <pre class="block-output">{blockString}</pre>
</section>
