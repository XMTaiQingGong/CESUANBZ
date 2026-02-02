/**
 * 农历与公历互转，支持闰月（1900-2100）
 * 数据表来源：农历1900-2100润大小信息表（十六进制）
 */

const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520
];

/** 取某年农历信息：闰月月份(0无)、各月天数(29/30)、闰月天数 */
function getLunarYearInfo(lunarYear) {
  const idx = lunarYear - 1900;
  if (idx < 0 || idx >= LUNAR_INFO.length) return null;
  const n = LUNAR_INFO[idx];
  const leapMonth = (n >> 12) & 0xf;
  const leapDays = (n >> 16) & 1 ? 30 : 29;
  const monthDays = [];
  for (let i = 0; i < 12; i++) {
    monthDays.push((n >> i) & 1 ? 30 : 29);
  }
  return { leapMonth, leapDays, monthDays };
}

/** 农历 year-month-day(isLeapMonth) 转为 儒略日（中午12点） */
export function lunarToJD(lunarYear, lunarMonth, lunarDay, isLeapMonth = false) {
  const info = getLunarYearInfo(lunarYear);
  if (!info) return null;
  const { leapMonth, leapDays, monthDays } = info;
  let totalDays = 0;
  for (let y = 1900; y < lunarYear; y++) {
    const yi = getLunarYearInfo(y);
    if (!yi) return null;
    let yearDays = yi.monthDays.reduce((a, b) => a + b, 0);
    if (yi.leapMonth) yearDays += yi.leapDays;
    totalDays += yearDays;
  }
  for (let m = 1; m < lunarMonth; m++) {
    totalDays += monthDays[m - 1];
  }
  if (!isLeapMonth && leapMonth && leapMonth <= lunarMonth) {
    totalDays += leapDays;
  }
  totalDays += lunarDay - 1;
  const jdBase = gregorianToJD(1900, 1, 31);
  return jdBase + totalDays;
}

/** 公历 y-m-d 转儒略日（中午） */
function gregorianToJD(y, m, d) {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  return Math.floor(jd);
}

/** 儒略日转公历 */
function jdToGregorian(jd) {
  const Z = Math.floor(jd + 0.5);
  const A = Math.floor((Z - 1867216.25) / 36524.25);
  const B = Z + 1 + A - Math.floor(A / 4);
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  return { year, month, day };
}

/** 公历 y-m-d 转农历（含闰月标记） */
export function gregorianToLunar(gYear, gMonth, gDay) {
  const jd = gregorianToJD(gYear, gMonth, gDay);
  const baseJD = gregorianToJD(1900, 1, 31);
  let offset = jd - baseJD;
  if (offset < 0) return null;
  let lunarYear = 1900;
  while (lunarYear <= 2100) {
    const info = getLunarYearInfo(lunarYear);
    if (!info) break;
    let yearDays = info.monthDays.reduce((a, b) => a + b, 0);
    if (info.leapMonth) yearDays += info.leapDays;
    if (offset < yearDays) break;
    offset -= yearDays;
    lunarYear++;
  }
  const info = getLunarYearInfo(lunarYear);
  if (!info) return null;
  const { leapMonth, leapDays, monthDays } = info;
  let lunarMonth = 1;
  let lunarDay;
  let isLeapMonth = false;
  for (let m = 0; m < 12; m++) {
    if (offset < monthDays[m]) {
      lunarMonth = m + 1;
      lunarDay = offset + 1;
      break;
    }
    offset -= monthDays[m];
    if (leapMonth === m + 1) {
      if (offset < leapDays) {
        lunarMonth = m + 1;
        isLeapMonth = true;
        lunarDay = offset + 1;
        break;
      }
      offset -= leapDays;
    }
  }
  if (lunarDay === undefined) {
    lunarMonth = 12;
    lunarDay = offset + 1;
  }
  return { lunarYear, lunarMonth, lunarDay, isLeapMonth };
}

/** 农历转公历 */
export function lunarToGregorian(lunarYear, lunarMonth, lunarDay, isLeapMonth = false) {
  const jd = lunarToJD(lunarYear, lunarMonth, lunarDay, isLeapMonth);
  if (jd == null) return null;
  return jdToGregorian(jd);
}

export { gregorianToJD };
