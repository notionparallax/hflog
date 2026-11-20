# HF Log

A small offline web app for confidential human factors reporting after a dive. It asks about your pre-dive state, any events and how close they came, and what went well, then gives you a block of text to paste into the notes of that dive in [Subsurface](https://subsurface-divelog.org/) or any other dive log.

The aim is to log every dive, including the uneventful ones, so that near misses and incidents can eventually be counted as rates against a real number of dives.

- Live: <https://notionparallax.github.io/hflog/>
- Blog post: [HF Log: a human factors note for every dive](https://notionparallax.co.uk/2026/hf-log)
- Spec and block format: [briefV2.md](briefV2.md) (the original build brief is [brief.md](brief.md))
- Example block: [example.txt](example.txt)

## How it works

There is no server and no account. The form produces a versioned `[DIVE-HF v1] … [/DIVE-HF]` block; the diver's log software carries it, alongside any free text in the notes. Pasting a block back into the app reloads it for editing. Nothing that identifies the diver is written into the block.

The in-progress form is saved in the browser so it survives the app being closed. **Start next dive** clears it and issues a new report ID.

## Code

- [src/lib/vocab.js](src/lib/vocab.js): every controlled vocabulary, slider description and reflection prompt. Edit taxonomies here and nowhere else.
- [src/lib/serialize.js](src/lib/serialize.js): block serialiser and parser.
- [src/components/](src/components/): the form sections.

Svelte 5 and Vite, installable as a PWA, deployed to GitHub Pages by [the deploy workflow](.github/workflows/deploy.yml) on every push to `main` (tests run first).

## Development

Needs Node 22.12 or later.

```sh
npm install
npm run dev     # local server
npm test        # vitest
npm run build
```

On Windows, if every test file fails with `Cannot read properties of undefined (reading 'config')`, the working directory has a lower-case drive letter (`c:\` rather than `C:\`), which makes vitest load itself twice. Run from `C:\repos\hflog`.
