# Background music (BGM)

There is no bgm provider in this build. Nothing searches a music library or generates a track, so the music bed is a file you supply.

## Getting a track in

1. Get a track the person owns or has licensed for this use, and ask for it if you don't have one.
2. Place it in the project: `npx hyperframes media-use resolve --from ./track.mp3 --type bgm --project .` (ingest; it lands in `.media/audio/bgm/` with a ledger record).
3. Reference the resolved path from the composition's `<audio>` element on the music track.

With no track, deliver silent and say so in one line with how to add one (`sound.md`). Do not write music in code or build a chain of synthesized tones: nobody can hear whether it is good.

## Fitting it to the cut

- **Level.** A bed under narration sits around -18 dB (volume about 0.12); a silent film can run it near full (about 0.9). Duck it under the voice (`mixing.md`).
- **Entry point.** Do not assume the beginning of the track is the best edit point. Check the opening against later sections. If it starts with a quiet build but a later section has a stronger, clean entrance, trim from that section and apply a short fade-in and a longer fade-out.
- **Length.** The final music file must cover the full cut without a silent tail. Repeat the check whenever the composition duration changes.
- **Loops.** Library music often comes as 15–30 s loops; loop the bed to the film with a 0.4 s fade-in and a 1.5 s fade-out (`film.md`).
