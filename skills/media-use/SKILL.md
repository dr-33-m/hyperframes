---
name: media-use
description: Get or make any media for a HyperFrames video - sound effects, images, logos, voiceover, generated video, transcripts, cutouts, colour grades and looks - with free local tools, and mix placed audio. Also for footage that looks dark, flat or dull, or should be stylized or hidden.
---

**Plugin installs:** Before setup or freshness commands, follow [plugin execution rules](../hyperframes/references/plugin-installation.md) when this skill is inside a HyperFrames plugin.

# Media in HyperFrames

Media lands as a local file in the project's `assets/` with a ledger record; renders never fetch. One verb finds or makes it:

```bash
npx hyperframes media-use resolve --type <type> --intent "<what you need>" --project <dir>
```

It prints one line, `resolved <id> → <path> (<type>, <metadata>)`. List reusable assets first with `--candidates` and judge the fit yourself; reuse, ingest (`--from`) and adopt are in `references/resolve.md`.

## Where it comes from

| Need | Source | Notes |
| --- | --- | --- |
| Sound effects (`sfx`) | Openverse (free, CC BY credit); bundled library | Offline fallback is bundled |
| Images | Local FLUX (mflux), if installed; codex CLI on the person's own ChatGPT plan | Local first |
| Logos (`logo`) | theSVG, GitHub avatar, favicon | Never redrawn |
| Voiceover (`voice`) | `npx hyperframes tts` (Kokoro, on device) | |
| Generated video (`video`) | Local LTX, if installed | Generic clips only |
| Transcripts | `npx hyperframes transcribe` (Parakeet or whisper) | |
| Cutouts | `npx hyperframes remove-background` | |
| Grades, LUTs, looks | `npx hyperframes media-treatment` | |

Music (`bgm`) and icons have no provider in this build: source the file yourself (a track or icon set the person supplies) and place it with `--from`.

**Host apps.** Inside an app with its own media tools, use those first.

**Local only.** Everything here runs on the machine. Pass `--local-only` to skip network providers (Openverse, logo sources) and use only the cache and bundled assets.

**Credits.** Never tell the person prices or estimates for a run. Nothing here bills an account.

## Looks on real footage

Feedback that footage is dark, flat or dull, should feel retro or printed, needs a face hidden, or needs a reveal is media intent. Inspect the real `<img>`/`<video>`, pick one intent, and follow `references/media-treatments.md`; persist with `npx hyperframes media-treatment`, never a CSS, SVG or `.cube` stand-in.

## Offer once, never add silently

Scan a piece you build or review once for concrete gaps (on-screen text with no voiceover, emoji standing in for icons, placeholder images, silent cuts, 10 s+ with no music, a colour cast) and offer the fixes in one ask. No signal, no suggestion; respect "leave it".

## Where to look

| Task | Read |
| --- | --- |
| Resolve, reuse, adopt, ingest, flags | `references/resolve.md` |
| Grading, LUTs, `grade-compare` | `references/grading.md` |
| Voiceover, sound effects, captions, transcription | `references/audio.md` |
| Cut, reframe or transform media | `references/operations.md` |
| Treatments, realtime effects, overlays, reveals | `references/media-treatments.md` |
| Install, credentials, `--provider`, `--local-only`, RAM ladders | `references/setup-providers.md` |
| Fades, gain, ducking, automation, effects, buses on placed tracks | `references/mixing.md` |
| Local commands: grade, cutout, loudness, beats | `references/local.md` |
| Remembered preferences | `references/memory.md` |
