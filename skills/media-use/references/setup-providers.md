# Setup and providers — install, RAM ladders, forcing a provider

## Setup — no account needed

Nothing here needs an account. Local tools and free sources run on the machine; install the ones you want from the tables below. Verify setup with:

```bash
npx hyperframes media-use resolve --doctor
```

## Providers

Local tools are opt-in alternatives where they exist: mflux for image, Kokoro for voice, Parakeet for transcription, and LTX for local video generation. `resolve` spec-checks AVAILABLE RAM for those local ladders inside the CLI (the image tiers are listed in `references/operations.md`).

| Type      | Provider / path                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------- |
| bgm       | No provider in this build: supply the track and place it with `--from`. A host app's own music tools come first |
| sfx       | Openverse (CC0 / CC BY, no account), bundled library offline; a host app's own sound tools come first           |
| image     | Optional local mflux; codex `image_gen` upsell                                                                  |
| voice     | Optional local **Kokoro** (free, on-device)                                                                     |
| icon      | No provider in this build: supply the icon set and place it with `--from`                                       |
| logo      | theSVG (thesvg.org), then GitHub org avatar, then domain favicon (all free)                                     |
| grade/lut | Local core-preset map, `params` look index, deterministic `buildCube` fallback                                  |
| video     | Optional local LTX (`videogen` ladder). Generic clips only; no presenter video                                  |

Local Kokoro (voice), mflux (image), and LTX (video) run on-device (free, private, offline once cached). The `codex` CLI remains the ChatGPT-sub image upsell. Paid calls follow the Credits rule in `SKILL.md`: no prices unasked, and a question only when a step won't fit.

To force a specific generator (e.g. a user says "make this image with codex"), pass `--provider codex`: it pins resolution to that provider and skips the default provider. See `references/operations.md` for the RAM ladders and provider recipes.

`--local-only` skips every network provider, leaving the project + global cache and any installed local provider. A type with no local source (`bgm`, `icon`) then needs a file you supply.

## CLI tools used (what to run, and how to enable each)

`resolve` auto-cascades; each provider shells one CLI. Local tools are OPT-IN alternatives where they exist; install one to unlock its free, private, on-device path. Only `ffmpeg`/`ffprobe` are strictly required for the tool to run at all.

| Tool               | Serves                                                                      | Install                                                                                                                                                                                                                                                         |
| ------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ffmpeg`/`ffprobe` | adopt probing, smart-grade signalstats, cut, duck bake, loudnorm            | system package (`brew install ffmpeg`)                                                                                                                                                                                                                          |
| `mflux-generate`   | local image gen (FLUX), best-for-RAM                                        | `uv venv ~/.venvs/mflux && VIRTUAL_ENV=~/.venvs/mflux uv pip install mflux==0.9.6`                                                                                                                                                                              |
| `codex`            | image gen upsell (ChatGPT sub)                                              | Codex CLI, logged in via ChatGPT (owns its own auth)                                                                                                                                                                                                            |
| `parakeet-mlx`     | local transcription (default ASR, best) on Apple Silicon                    | `uv venv ~/.venvs/parakeet && VIRTUAL_ENV=~/.venvs/parakeet uv pip install parakeet-mlx`                                                                                                                                                                        |
| `ltx-2-mlx`        | local video gen                                                             | `git clone https://github.com/dgrauet/ltx-2-mlx && cd ltx-2-mlx && uv sync --all-extras`                                                                                                                                                                        |
| `npx hyperframes`  | Kokoro TTS (voice), Parakeet or whisper.cpp (transcribe), remove-background | via the hyperframes CLI; Kokoro needs Python 3.10+ with `pip install kokoro-onnx soundfile`; Parakeet on macOS, Windows and glibc 2.32+ Linux: `npx hyperframes models install parakeet`; whisper.cpp is built on first use (Homebrew on macOS, else git+cmake) |

The RAM-graded local-model shortlist + exact per-tier install/invoke lives in the CLI's bundled media-use engine, not in the standalone skill. Without a tool on PATH, its provider prints a one-line diagnostic to stderr and resolve falls through where another provider exists (e.g. no `mflux` -> codex image upsell; no `parakeet-mlx` -> whisper.cpp).
