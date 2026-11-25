import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanDescription, summarize } from "./summarize.mjs";

test("cleanDescription strips tags, emoji, name prefix and extra sentences", () => {
  assert.equal(cleanDescription("📑 PageIndex: Document Index for Vectorless, Reasoning-based RAG", "PageIndex"), "Document Index for Vectorless, Reasoning-based RAG");
  assert.equal(cleanDescription("[EMNLP2025] LightRAG: Simple and Fast Retrieval-Augmented Generation", "LightRAG"), "Simple and Fast Retrieval-Augmented Generation");
  assert.equal(cleanDescription("Multi-tenant RAG API powered by LightRAG/RAG-Anything. Auto-selects best parser", "rag-api"), "Multi-tenant RAG API powered by LightRAG/RAG-Anything");
  assert.equal(cleanDescription(null, "x"), "");
});

const day = (date, contributionCount) => ({ date, contributionCount, weekday: new Date(date).getUTCDay() });

test("summarize computes totals, streaks, busiest month and month labels", () => {
  const weeks = [
    { contributionDays: [day("2026-09-27", 0), day("2026-09-28", 2), day("2026-09-29", 1), day("2026-09-30", 4), day("2026-10-01", 0), day("2026-10-02", 3), day("2026-10-03", 9)] },
    { contributionDays: [day("2026-10-04", 1), day("2026-10-05", 0)] },
    { contributionDays: [day("2026-10-11", 0)] },
    { contributionDays: [day("2026-10-18", 0)] },
  ];
  const s = summarize(weeks, new Date("2026-11-25T08:00:00Z"));
  assert.equal(s.total, 20);
  assert.equal(s.longestStreak, 3); // 09-28..09-30; 10-02..10-04 is also 3
  assert.deepEqual(s.bestDay, { date: "2026-10-03", count: 9 });
  assert.deepEqual(s.busiest, { label: "Oct ’26", count: 13 });
  assert.deepEqual(s.months, [{ label: "Oct", week: 0 }]);
  assert.equal(s.updated, "2026-11-25");
  assert.deepEqual(s.weeks[1][0], { date: "2026-10-04", count: 1, weekday: 0 });
});
