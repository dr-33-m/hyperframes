# Audio engine — voiceover, music, SFX, captions, transcription

Each audio piece has its own command in this build; the one-shot `audio.mjs` engine (voice, music and effects from one request file) was removed with its HeyGen providers:

- **Voiceover**: `npx hyperframes tts "<line>" -o assets/voice/<name>.wav` (Kokoro, on device), one call per line. Word timings for captions come from `npx hyperframes transcribe` on the result.
- **Music**: there is no music provider in this build. Supply the track yourself and place it with `npx hyperframes media-use resolve --type bgm --from <file>` (see `audio/references/bgm.md`).
- **Sound effects**: `npx hyperframes media-use resolve --type sfx --intent "<cue>"`. Openverse first, then the bundled library; no account or key.

Transcription / background removal / captions use the `hyperframes` CLI (`transcribe`, `remove-background`), see the per-topic guides in `audio/references/` (`tts.md`, `bgm.md`, `sfx.md`, `transcribe.md`, `remove-background.md`, `captions/`).

Transcription through `scripts/transcribe.mjs` defaults to Parakeet (better than whisper.cpp: 6.05% vs 7.44% WER, 5-10x faster), with whisper.cpp auto-fallback (see `references/operations.md`). `npx hyperframes transcribe` picks its own engine: Parakeet when installed, otherwise whisper with the `small.en` model by default.
