// SPDX-License-Identifier: MIT
// Charm the Commuter: Forecast a City That Isn't
// Writes one line of weather forecast (at most 140 characters) for the
// invented city of Tumbletown to /output/entry.txt, then verifies it.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "In Tumbletown, rain falls upward till nine, then sunshine — the 8:15 bus is early, your coffee stays hot, and even Monday cracks a smile.";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outPath = join(outDir, "entry.txt");

type GateFailure = { rule: string; detail: string };

function checkLength(text: string): GateFailure | null {
  const n = [...text].length;
  return n >= 1 && n <= 140
    ? null
    : { rule: "length", detail: `${n} chars, want 1-140` };
}

function checkSingleLine(text: string): GateFailure | null {
  return text.includes("\n") || text.includes("\r")
    ? { rule: "single-line", detail: "must be one line" }
    : null;
}

function checkNoControlChars(text: string): GateFailure | null {
  for (const ch of text) {
    if (ch.codePointAt(0)! < 0x20) {
      return { rule: "no-control-chars", detail: `U+${ch.codePointAt(0)!.toString(16)}` };
    }
  }
  return null;
}

function checkNoEdgeWhitespace(text: string): GateFailure | null {
  return text !== text.trim()
    ? { rule: "no-edge-whitespace", detail: "leading/trailing whitespace" }
    : null;
}

function checkNotOnlyWhitespace(text: string): GateFailure | null {
  return text.trim().length === 0
    ? { rule: "not-only-whitespace", detail: "empty after trim" }
    : null;
}

const GATE_CHECKS = [
  checkLength,
  checkSingleLine,
  checkNoControlChars,
  checkNoEdgeWhitespace,
  checkNotOnlyWhitespace,
];

function checkGate(text: string): void {
  for (const check of GATE_CHECKS) {
    const failure = check(text);
    if (failure) throw new Error(`gate[${failure.rule}]: ${failure.detail}`);
  }
}

checkGate(ENTRY);
mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, ENTRY, "utf8");
const back = readFileSync(outPath, "utf8");
if (back !== ENTRY) throw new Error("verify: read-back mismatch");
console.log(`wrote ${outPath} (${[...ENTRY].length} chars)`);
