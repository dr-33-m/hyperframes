import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openAudioMeta } from "./audio-meta.mjs";

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), "audio-meta-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test("updates the read file from byte zero, truncates, and retains its mode", (t) => {
  const path = join(fixture(t), "meta.json");
  writeFileSync(path, JSON.stringify({ voices: ["long existing voice metadata"] }), {
    mode: 0o600,
  });
  const originalMode = statSync(path).mode;
  const handle = openAudioMeta(path);
  assert.deepEqual(handle.value, { voices: ["long existing voice metadata"] });
  handle.write({ voices: ["声"] });
  assert.equal(readFileSync(path, "utf8"), JSON.stringify({ voices: ["声"] }, null, 2));
  assert.equal(statSync(path).mode, originalMode);
});

test("pathname replacement cannot redirect the existing-file write", (t) => {
  const dir = fixture(t);
  const path = join(dir, "meta.json");
  const moved = join(dir, "original.json");
  writeFileSync(path, "{}");
  const handle = openAudioMeta(path);
  renameSync(path, moved);
  writeFileSync(path, "replacement must survive");
  handle.write({ voices: [] });
  assert.equal(readFileSync(path, "utf8"), "replacement must survive");
  assert.deepEqual(JSON.parse(readFileSync(moved, "utf8")), { voices: [] });
});

test("existing symlink outputs retain their original target even after retargeting", (t) => {
  const dir = fixture(t);
  const path = join(dir, "meta.json");
  const target = join(dir, "target.json");
  const victim = join(dir, "victim.json");
  writeFileSync(target, "{}");
  writeFileSync(victim, "untouched");
  symlinkSync(target, path);
  const handle = openAudioMeta(path);
  rmSync(path);
  symlinkSync(victim, path);
  handle.write({ bgm: null });
  assert.equal(readFileSync(victim, "utf8"), "untouched");
  assert.deepEqual(JSON.parse(readFileSync(target, "utf8")), { bgm: null });
});

test("missing output is created only when saved", (t) => {
  const path = join(fixture(t), "meta.json");
  const handle = openAudioMeta(path);
  assert.deepEqual(handle.value, {});
  assert.throws(() => statSync(path), { code: "ENOENT" });
  handle.write({ sfx: [] });
  assert.deepEqual(JSON.parse(readFileSync(path, "utf8")), { sfx: [] });
});

for (const replacement of ["file", "symlink"]) {
  test(`new output does not overwrite a racing ${replacement}`, (t) => {
    const dir = fixture(t);
    const path = join(dir, "meta.json");
    const victim = join(dir, "victim.json");
    const handle = openAudioMeta(path);
    writeFileSync(victim, "untouched");
    if (replacement === "symlink") symlinkSync(victim, path);
    else writeFileSync(path, "untouched");
    assert.throws(() => handle.write({}), { code: "EEXIST" });
    assert.equal(readFileSync(path, "utf8"), "untouched");
    assert.equal(readFileSync(victim, "utf8"), "untouched");
  });
}

test("malformed merge base remains an error without changing bytes", (t) => {
  const path = join(fixture(t), "meta.json");
  writeFileSync(path, "bad json");
  assert.throws(() => openAudioMeta(path), SyntaxError);
  assert.equal(readFileSync(path, "utf8"), "bad json");
});
