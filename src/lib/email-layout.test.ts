// Run: node --test src/lib/email-layout.test.ts   (Node 24 strips TS types)
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderEmailHtml, buildEmailText, subjectToTitle } from "./email-layout.ts";

test("escapes html in body (no injection)", () => {
  const html = renderEmailHtml({ bodyText: 'a <script> & "x"', locale: "ko" });
  assert.ok(html.includes("&lt;script&gt;"), "tag escaped");
  assert.ok(html.includes("&amp;"), "ampersand escaped");
  assert.ok(!html.includes("a <script>"), "raw script not present");
});

test("CTA button present with locale label + href when statusUrl given", () => {
  const html = renderEmailHtml({ bodyText: "hi", locale: "en", statusUrl: "https://x.test/s?id=1" });
  assert.ok(html.includes("Track your request"), "en label");
  assert.ok(html.includes('href="https://x.test/s?id=1"'), "href present");
});

test("CTA absent when no statusUrl", () => {
  assert.ok(!renderEmailHtml({ bodyText: "hi", locale: "ko" }).includes("진행 상황 확인"));
});

test("title renders as h1 heading when provided", () => {
  const html = renderEmailHtml({ title: "견적 문의가 접수되었습니다", bodyText: "hi", locale: "ko" });
  assert.match(html, /<h1[^>]*>견적 문의가 접수되었습니다<\/h1>/);
});

test("reference value renders with localized label", () => {
  const html = renderEmailHtml({ bodyText: "hi", locale: "en", referenceValue: "ABCD1234" });
  assert.ok(html.includes("Quote No."), "label");
  assert.ok(html.includes("ABCD1234"), "value");
});

test("attachment names render with attached label", () => {
  const html = renderEmailHtml({ bodyText: "hi", locale: "ko", attachmentNames: ["견적서.pdf"] });
  assert.ok(html.includes("첨부"), "label");
  assert.ok(html.includes("견적서.pdf"), "filename");
});

test("blank lines -> paragraphs, single newline -> <br>", () => {
  const html = renderEmailHtml({ bodyText: "p1a\np1b\n\np2", locale: "ko" });
  assert.ok(html.includes("p1a<br>p1b"));
  assert.match(html, /<p[^>]*>p2<\/p>/);
});

test("subjectToTitle strips leading bracket prefix", () => {
  assert.equal(subjectToTitle("[나진테크] 견적 문의가 접수되었습니다"), "견적 문의가 접수되었습니다");
  assert.equal(subjectToTitle("no prefix"), "no prefix");
});

test("text fallback appends reference + labeled status url", () => {
  const t = buildEmailText({ bodyText: "hi", locale: "zh", statusUrl: "https://x.test/s", referenceValue: "Q1" });
  assert.equal(t, "hi\n\n报价编号: Q1\n查询进度: https://x.test/s");
});

test("text fallback unchanged when neither ref nor url", () => {
  assert.equal(buildEmailText({ bodyText: "hi", locale: "ko" }), "hi");
});
