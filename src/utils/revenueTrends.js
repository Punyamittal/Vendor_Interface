/** Local calendar date as YYYY-MM-DD (vendor timezone). */
export function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addCalendarDays(dateKey, deltaDays) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d + deltaDays);
  return localDateKey(dt);
}

function parseDayKey(day) {
  if (typeof day !== 'string') return '';
  return day.slice(0, 10);
}

/** Signed % change; if previous is 0 and current > 0, treat as +100% growth. */
export function percentChangeSigned(current, previous) {
  const c = Number(current) || 0;
  const p = Number(previous) || 0;
  if (p === 0) return c === 0 ? 0 : 100;
  const raw = ((c - p) / p) * 100;
  return Math.round(raw * 10) / 10;
}

function sumRevenueEndingOn(endKey, numDays, revenueByDay) {
  let sum = 0;
  let key = endKey;
  for (let i = 0; i < numDays; i++) {
    sum += revenueByDay.get(key) ?? 0;
    key = addCalendarDays(key, -1);
  }
  return sum;
}

/**
 * @param {Array<{ day: string, total_revenue: number }>} rows from v_shop_daily_revenue (any order)
 * @returns {{ today: number, week: number, month: number, trends: { today, week, month } }}
 *   Amounts: today = local today; week = last 7 local days incl. today; month = last 30 local days incl. today.
 *   Trends: today vs yesterday; week vs prior 7 days; month vs prior 30 days.
 */
export function computeEarningsStats(rows) {
  const revenueByDay = new Map();
  for (const r of rows || []) {
    const key = parseDayKey(r.day);
    if (!key) continue;
    const v = Number(r.total_revenue) || 0;
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + v);
  }

  const todayKey = localDateKey();
  const todayRev = revenueByDay.get(todayKey) ?? 0;
  const yesterdayKey = addCalendarDays(todayKey, -1);
  const yesterdayRev = revenueByDay.get(yesterdayKey) ?? 0;

  const thisWeekRev = sumRevenueEndingOn(todayKey, 7, revenueByDay);
  const prevWeekEnd = addCalendarDays(todayKey, -7);
  const lastWeekRev = sumRevenueEndingOn(prevWeekEnd, 7, revenueByDay);

  const thisMonthRev = sumRevenueEndingOn(todayKey, 30, revenueByDay);
  const prevMonthEnd = addCalendarDays(todayKey, -30);
  const lastMonthRev = sumRevenueEndingOn(prevMonthEnd, 30, revenueByDay);

  return {
    today: todayRev,
    week: thisWeekRev,
    month: thisMonthRev,
    trends: {
      today: percentChangeSigned(todayRev, yesterdayRev),
      week: percentChangeSigned(thisWeekRev, lastWeekRev),
      month: percentChangeSigned(thisMonthRev, lastMonthRev)
    }
  };
}
