const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthName = (date) => MONTHS[Number(date.slice(5, 7)) - 1];

/**
 * Tidy a GitHub repo description for display: drop leading tags/emoji, a
 * "Name:" prefix, and anything after the first sentence.
 *
 * @param {string | null} text
 * @param {string} name
 */
export function cleanDescription(text, name) {
  let s = (text ?? "").trim();
  s = s.replace(/^(\[[^\]]*\]\s*|[^\p{L}\p{N}]+)+/u, "");
  if (s.toLowerCase().startsWith(`${name.toLowerCase()}:`)) s = s.slice(name.length + 1).trim();
  const end = s.search(/\.\s/);
  if (end > 0) s = s.slice(0, end);
  return s.replace(/\.$/, "");
}

/**
 * Turn GitHub's contribution calendar into what the skyline scene renders.
 *
 * @param {{contributionDays: {date: string, contributionCount: number, weekday: number}[]}[]} weeks
 * @param {Date} now
 */
export function summarize(weeks, now) {
  const days = weeks.flatMap((w) => w.contributionDays);
  const byMonth = new Map();
  let streak = 0;
  let longestStreak = 0;
  let best = days[0];
  for (const d of days) {
    streak = d.contributionCount ? streak + 1 : 0;
    longestStreak = Math.max(longestStreak, streak);
    if (d.contributionCount > best.contributionCount) best = d;
    const key = d.date.slice(0, 7);
    byMonth.set(key, (byMonth.get(key) ?? 0) + d.contributionCount);
  }
  const [busiestKey, busiestCount] = [...byMonth].reduce((a, b) => (b[1] > a[1] ? b : a));

  const months = [];
  weeks.forEach((w, week) => {
    const first = w.contributionDays.find((d) => d.date.endsWith("-01"));
    // Skip a label that would hang off the right edge.
    if (first && week < weeks.length - 2) months.push({ label: monthName(first.date), week });
  });

  return {
    updated: now.toISOString().slice(0, 10),
    total: days.reduce((sum, d) => sum + d.contributionCount, 0),
    weeks: weeks.map((w) =>
      w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, weekday: d.weekday })),
    ),
    months,
    busiest: { label: `${monthName(busiestKey)} ’${busiestKey.slice(2, 4)}`, count: busiestCount },
    longestStreak,
    activeDays: days.filter((d) => d.contributionCount).length,
    // The calendar ends today, so its last 90 entries are the last 90 days.
    last90: days.slice(-90).reduce((sum, d) => sum + d.contributionCount, 0),
    bestDay: { date: best.date, count: best.contributionCount },
  };
}
