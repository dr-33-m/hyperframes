import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { findFfBinary } from "@hyperframes/parsers/ff-binaries";
import { readAudio } from "./read.js";
import { READ_VERSION } from "./types.js";

const RATE = 22_050;
const dir = mkdtempSync(join(tmpdir(), "hf-audio-read-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

function wav(name: string, seconds: number, fill: (t: number) => number): string {
  const frames = Math.round(seconds * RATE);
  const data = Buffer.alloc(frames * 2);
  for (let i = 0; i < frames; i++)
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, fill(i / RATE))) * 32767), i * 2);
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  const path = join(dir, name);
  writeFileSync(path, Buffer.concat([header, data]));
  return path;
}

const voiced = (t: number) =>
  (t >= 0.5 && t < 2) || (t >= 3 && t < 4.5) ? 0.3 * Math.sin(2 * Math.PI * 180 * t) : 0;

const ffmpeg = findFfBinary("ffmpeg") && findFfBinary("ffprobe");

describe.skipIf(!ffmpeg)("readAudio", () => {
  it("reads the mix with its sidecar transcript, and reuses the cache", async () => {
    const path = wav("talk.wav", 6, (t) => voiced(t));
    writeFileSync(
      `${path}.transcript.json`,
      JSON.stringify({
        audio: "talk.wav",
        words: [
          { text: "一口气", start: 0.5, end: 1.4 },
          { text: "了解。", start: 1.4, end: 2 },
          { text: "伊朗", start: 3, end: 4.5 },
        ],
      }),
    );
    const cacheDir = join(dir, "cache-mix");
    const first = await readAudio(path, "talk.wav", { cacheDir });
    expect(first.cached).toBe(false);
    expect(first.analysis).toMatchObject({ separation: "mix", stems: [], music: null });
    expect(first.analysis.voice!.sentences.map((s) => s.text)).toEqual(["一口气了解。", "伊朗"]);
    expect(first.analysis.voice!.medianPitchHz).toBeGreaterThan(170);
    const text = readFileSync(first.textPath, "utf8");
    expect(text).toContain('voice    "一口气了解。"');
    expect(text).toContain("pause    1.0 s, silent");
    const again = await readAudio(path, "talk.wav", { cacheDir });
    expect(again.cached).toBe(true);
    writeFileSync(
      `${path}.transcript.json`,
      JSON.stringify({ words: [{ text: "换了", start: 0.5, end: 2 }] }),
    );
    const edited = await readAudio(path, "talk.wav", { cacheDir });
    expect(edited.cached).toBe(false);
    expect(edited.analysis.voice!.sentences[0]!.text).toBe("换了");
  });

  it("reads neither voice nor effects from a bare mix without a transcript", async () => {
    const path = wav("local.wav", 3, voiced);
    const cacheDir = join(dir, "cache-local");
    const { analysis, jsonPath } = await readAudio(path, "local.wav", { cacheDir });
    expect(analysis).toMatchObject({ separation: "mix", voice: null, effects: null, music: null });
    expect(analysis.warnings[0]).toContain("no transcript");
    expect(analysis.warnings[0]).toContain("hyperframes transcribe local.wav");
    expect(existsSync(jsonPath)).toBe(true);
    expect(analysis.version).toBe(READ_VERSION);
  });
});
