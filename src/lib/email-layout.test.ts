// Run: node --test src/lib/email-layout.test.ts   (Node 24 strips TS types)
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderEmailHtml, buildEmailText } from "./email-layout.ts";

test("escapes html in body (no injection)", () => {
  const html = renderEmailHtml({ bodyText: 'a <script> & "x"', locale: "ko" });
  assert.ok(html.includes("&lt;script&gt;"), "tag escaped");
  assert.ok(html.includes("&amp;"), "ampersand escaped");
  assert.ok(!html.includes("<script>"), "raw script tag not present");
});

test("CTA button present with locale label + href when statusUrl given", () => {
  const html = renderEmailHtml({ bodyText: "hi", locale: "en", statusUrl: "https://x.test/s?id=1" });
  assert.ok(html.includes("Track your request"), "en label");
  assert.ok(html.includes('href="https://x.test/s?id=1"'), "href present");
});

test("CTA absent when no statusUrl", () => {
  const html = renderEmailHtml({ bodyText: "hi", locale: "ko" });
  assert.ok(!html.includes("진행 상황 확인"), "no CTA label");
});

test("blank lines -> paragraphs, single newline -> <br>", () => {
  const html = renderEmailHtml({ bodyText: "p1a\np1b\n\np2", locale: "ko" });
  assert.ok(html.includes("p1a<br>p1b"), "single newline -> br");
  assert.match(html, /<p[^>]*>p2<\/p>/, "blank line -> new paragraph");
});

test("text fallback appends labeled status url", () => {
  const t = buildEmailText({ bodyText: "hi", locale: "zh", statusUrl: "https://x.test/s" });
  assert.equal(t, "hi\n\n查询进度: https://x.test/s");
});

test("text fallback unchanged when no statusUrl", () => {
  assert.equal(buildEmailText({ bodyText: "hi", locale: "ko" }), "hi");
});
