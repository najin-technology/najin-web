// Run: node --test src/lib/detect-script.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { detectScript, matchesLocale } from "./detect-script.ts";

test("detects Korean (Hangul)", () => {
  assert.equal(detectScript("견적 접수를 잠시 중단합니다"), "ko");
});
test("detects Chinese (Han, no Hangul)", () => {
  assert.equal(detectScript("暂停接受询价"), "zh");
});
test("detects English", () => {
  assert.equal(detectScript("We are not taking quotes right now"), "en");
});
test("empty / blank", () => {
  assert.equal(detectScript("   "), "empty");
});
test("numbers + symbols only → other", () => {
  assert.equal(detectScript("12,000 !!! ###"), "other");
});
test("matchesLocale: Korean text in en field → mismatch (warn)", () => {
  assert.equal(matchesLocale("견적 중단", "en"), false);
});
test("matchesLocale: English text in en field → ok", () => {
  assert.equal(matchesLocale("Out of capacity", "en"), true);
});
test("matchesLocale: empty/symbol → no warn", () => {
  assert.equal(matchesLocale("", "en"), true);
  assert.equal(matchesLocale("123", "zh"), true);
});
