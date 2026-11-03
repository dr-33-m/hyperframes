# Requirements & Caches

## Credential & key priority

Keys resolve in this order — **first match wins**:

| Provider                      | Resolution order (first non-empty wins)                                                                         | Local deps when used                |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **ElevenLabs** (TTS fallback) | `$ELEVENLABS_API_KEY`                                                                                           | `pip install elevenlabs`            |
| **Gemini** (TTS, explicit)    | `$GEMINI_API_KEY` → `$GOOGLE_API_KEY`, or service-account JSON (`GOOGLE_APPLICATION_CREDENTIALS` / `GCS_CREDS`) | `pip install google-auth requests`  |
| **Kokoro** (TTS, no key)      | always — final voice fallback                                                                                   | `pip install kokoro-onnx soundfile` |

Local voice (Kokoro) needs no key or account. Keys come from your environment or a project `.env`; never put them in a request file or composition. Each engine is optional: with no key, voice falls back to Kokoro.

## Model caches & system dependencies

Each command downloads its own model on first run and caches it under `~/.cache/hyperframes/`:

- **TTS (Gemini)** — no local model; needs a Gemini key or service-account credentials and `google-auth requests` in the Python 3 environment.
- **TTS (ElevenLabs)** — API key + `ffmpeg`.
- **TTS (Kokoro)** — Kokoro-82M (~311 MB) + voices (~27 MB) in `tts/`. Requires Python 3.8+ with `kokoro-onnx` and `soundfile` (`pip install kokoro-onnx soundfile`). Non-English text also needs `espeak-ng` system-wide.
- **Transcribe** — Whisper model size depending on choice (75 MB – 3.1 GB) in `whisper/`, downloaded from HuggingFace on first use. `whisper.cpp` itself is NOT bundled: the CLI resolves it from PATH, installs via Homebrew (macOS), or builds it from source with git+cmake on first use (`$HYPERFRAMES_WHISPER_PATH` overrides).
- **Remove-background** — `u2net_human_seg` (~168 MB ONNX) in `background-removal/models/`. Peak inference RAM ~1.5 GB.

Run `npx hyperframes doctor` if a command fails because of a missing dependency.
