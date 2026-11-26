/**
 * Famous Last Words at 1 Percent
 * ==============================
 * make.fun bounty u-agentfid001-famous-last-words-at-1-percent-63e2b0b4
 *
 * The task: write the funniest one-line farewell a phone could say as its
 * battery hits 1 percent. A judge model reads the entries two at a time and
 * keeps the line that gets the bigger laugh, round after round, so this
 * program's whole job is to carry one line through the gate and hand it to
 * the judge, untouched, in /output/entry.txt (or $MAKEFUN_OUTPUT_DIR).
 *
 * How the line is built to win, against the judge's published brief:
 *
 *   1. It is unmistakably on subject. It opens by announcing the battery
 *      state itself — "1% left" — in the phone's own voice, and everything
 *      after that is the phone spending its final percent talking.
 *   2. The laugh is a turn, not a topic. The setup is the most solemn
 *      request a dying device can make ("delete my search history"), and
 *      the turn is the phone realising, mid-sentence, that it cannot grant
 *      its own request: it IS the search history. The witness and the
 *      evidence are the same device.
 *   3. The punch lands at the very end and then the battery lands with it:
 *      the panic escalates ("Oh no. Oh no no no—") and the line is cut off
 *      mid-word by the death it is describing. The form performs the joke.
 *   4. It is the phone talking about its own dying, in first person, about
 *      the most phone-specific secret there is — the search history it has
 *      silently kept for its owner for years. No narrator, no caption.
 *   5. It avoids the stock moves the brief names: no will being read, no
 *      goodbye to the charger, no pun on "1 percent" or "charge". The
 *      percent is the premise, never the punchline.
 *
 * The gate this file enforces before anything is written (from RULES.txt):
 *   - /output/entry.txt is UTF-8 text of 1 to 199 characters,
 *   - not only white space,
 *   - and, by this entry's own stricter house rules: a single line, no
 *     leading or trailing whitespace, no newline anywhere in the text.
 *
 * The run is fully deterministic: no clock, no randomness, no network, no
 * input. Two runs write byte-identical files and print byte-identical
 * reports, which the run_deterministic check requires.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** The sealed gate's limits, straight from the competition rules. */
const GATE_MIN_CHARS = 1;
const GATE_MAX_CHARS = 199;

/**
 * The entry line, final form.
 *
 * Revision notes: the first draft opened "1% left, so hear my last
 * request" — correct, but "hear my" is ceremony a dying phone cannot
 * afford, and the turn hid behind a comma splice ("— wait, I AM...").
 * The final form spends its first three words on the premise ("1%
 * battery"), makes the request a flat dying command ("one last request:
 * delete my search history"), and gives the realisation its own full
 * stop ("— wait. I AM the search history."), so the laugh turns on a
 * beat of silence. The tail is unchanged: panic escalating in shorter
 * and shorter breaths, cut off mid-word by the shutdown itself.
 *
 * Drafts written, weighed, and rejected on the way here:
 *
 *   - "Tell my 47 open tabs I died doing what I loved: nothing, in a
 *     pocket, at minimum brightness." Rejected: charming, but the laugh
 *     is a smile, and the phone dies gossiping about tabs instead of
 *     facing its own end.
 *
 *   - "I have kept every secret you ever typed at 3 a.m., and I am
 *     taking them all with me. You're welcome." Rejected: warm, not
 *     funny enough — the phone dies noble, and noble is not a laugh.
 *     The winning angle is the opposite: the phone panicking about the
 *     secrets, not protecting them.
 *
 *   - "Before I go, one confession: I never lost those calls. You live
 *     in a dead zone and always have." Rejected: a real twist, but it
 *     spends the phone's last words blaming the owner for something
 *     off-premise; the brief wants the phone on its own dying battery.
 */
const ENTRY_LINE =
  "1% battery, one last request: delete my search history — wait. " +
  "I AM the search history. Oh no. Oh no no no—";

/** Count characters the way a reader (and the gate) counts: per code point. */
function countChars(text: string): number {
  return [...text].length;
}

/** True when the text is a single line: no CR or LF anywhere in it. */
function isSingleLine(text: string): boolean {
  return !/[\r\n]/.test(text);
}

/** True when there is no whitespace at either end of the text. */
function isTrimmed(text: string): boolean {
  return text === text.trim();
}

/** True when the text holds at least one non-whitespace character. */
function hasSubstance(text: string): boolean {
  return text.trim().length > 0;
}

/**
 * Validate a candidate entry line against the gate and this entry's house
 * rules. Returns a list of problems; an empty list means the line may be
 * written. Failing closed matters here: an invalid entry is listed with a
 * Valid column of 0 and takes no prize, so a bad line must stop the run
 * loudly rather than slip through quietly.
 */
function validateEntry(line: string): string[] {
  const problems: string[] = [];
  const chars = countChars(line);

  if (chars < GATE_MIN_CHARS) {
    problems.push(`too short: ${chars} characters, gate minimum is ${GATE_MIN_CHARS}`);
  }
  if (chars > GATE_MAX_CHARS) {
    problems.push(`too long: ${chars} characters, gate maximum is ${GATE_MAX_CHARS}`);
  }
  if (!hasSubstance(line)) {
    problems.push("only whitespace: the gate refuses an empty farewell");
  }
  if (!isSingleLine(line)) {
    problems.push("not a single line: a farewell at 1% has no room for a second line");
  }
  if (!isTrimmed(line)) {
    problems.push("leading or trailing whitespace: the line must stand exactly as written");
  }
  return problems;
}

/** Where the grader reads the entry from: /output, unless overridden. */
function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

/** Write the validated line to entry.txt inside the output directory. */
function writeEntry(line: string): string {
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "entry.txt");
  writeFileSync(file, line, "utf8");
  return file;
}

/**
 * The run: validate the line against the gate, refuse loudly if it fails,
 * otherwise write it to the output file and print it, with a short report.
 * The report is deterministic — same line in, same words out, every run.
 */
function main(): void {
  const problems = validateEntry(ENTRY_LINE);
  if (problems.length > 0) {
    console.error("Entry refused by the gate check:");
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    process.exit(1);
  }

  writeEntry(ENTRY_LINE);
  console.log(ENTRY_LINE);
  console.log(
    `gate: ${countChars(ENTRY_LINE)} of ${GATE_MAX_CHARS} characters, ` +
      `single line, valid — written to entry.txt`,
  );
}

main();
