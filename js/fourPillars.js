/**
 * 四柱计算：年柱、月柱、日柱、时柱
 * 支持模式A（立春年界+节气月）与模式B（正月初一年界+农历月）
 */

import { TIANGAN, DIZHI } from './constants.js';
import { gregorianToJD, jdToGregorian } from './julian.js';
import { getMonthZhiByJD, getLiChunJD } from './solarTerms.js';
import { lunarToGregorian, gregorianToLunar } from './lunar.js';

/** 日柱：儒略日 → 干支 (2000-01-01 为庚辰日，序 16) */
function dayGanZhiFromJD(jd) {
  const baseJD = gregorianToJD(2000, 1, 1);
  const baseGanZhi = 16;
  const diff = jd - baseJD;
  const idx = (baseGanZhi + diff % 60 + 60) % 60;
  return { gan: idx % 10, zhi: idx % 12 };
}

/** 时干：五鼠遁日起时 — 甲己日起甲子，乙庚日起丙子，丙辛日起戊子，丁壬日起庚子，戊癸日起壬子 */
function hourGanFromDayGan(hourZhiIndex, dayGanIndex) {
  const startGan = [0, 2, 4, 6, 8][dayGanIndex % 5];
  const gan = (startGan + hourZhiIndex) % 10;
  return gan;
}

/** 年柱（模式A：立春为界） */
function getYearPillarSolar(gYear, gMonth, gDay, jd) {
  const liChunThis = getLiChunJD(gYear);
  const liChunNext = getLiChunJD(gYear + 1);
  let year = gYear;
  if (jd < liChunThis) year = gYear - 1;
  else if (jd >= liChunNext) year = gYear + 1;
  const gan = (year - 4) % 10;
  const zhi = (year - 4) % 12;
  return { gan, zhi };
}

/** 年柱（模式B：正月初一为界） */
function getYearPillarLunar(gYear, gMonth, gDay, lunarYear) {
  const gan = (lunarYear - 4) % 10;
  const zhi = (lunarYear - 4) % 12;
  return { gan, zhi };
}

/** 月柱（模式A：节气月） */
function getMonthPillarSolar(jd, year) {
  const { zhiIndex } = getMonthZhiByJD(jd, year);
  const yearGan = (year - 4) % 10;
  const monthGan = (yearGan * 2 + zhiIndex) % 10;
  return { gan: monthGan, zhi: zhiIndex };
}

/** 月柱（模式B：农历月） */
function getMonthPillarLunar(lunarMonth, lunarYear) {
  const zhiIndex = (lunarMonth + 1) % 12;
  const yearGan = (lunarYear - 4) % 10;
  const monthGan = (yearGan * 2 + zhiIndex) % 10;
  return { gan: monthGan, zhi: zhiIndex };
}

/** 时柱：时辰地支 + 五鼠遁得时干 */
function getHourPillar(hourZhiIndex, dayGanIndex) {
  const gan = hourGanFromDayGan(hourZhiIndex, dayGanIndex);
  return { gan, zhi: hourZhiIndex };
}

/**
 * 统一入口：根据公历/农历、模式、时辰 计算四柱
 * @param {Object} opts - { gYear, gMonth, gDay, hourZhiIndex (0-11 或 null), yearMode: 'solar'|'lunar', lunarYear, lunarMonth, lunarDay, isLeapMonth }
 */
export function calcFourPillars(opts) {
  const {
    gYear, gMonth, gDay,
    hourZhiIndex = null,
    yearMode = 'solar',
    lunarYear, lunarMonth, lunarDay, isLeapMonth
  } = opts;

  const jd = gregorianToJD(gYear, gMonth, gDay);
  const lunar = lunarYear != null ? { lunarYear, lunarMonth, lunarDay, isLeapMonth } : gregorianToLunar(gYear, gMonth, gDay);

  const dayPillar = dayGanZhiFromJD(jd);
  let yearPillar, monthPillar;

  if (yearMode === 'solar') {
    yearPillar = getYearPillarSolar(gYear, gMonth, gDay, jd);
    const refYear = jd < getLiChunJD(gYear) ? gYear - 1 : gYear;
    monthPillar = getMonthPillarSolar(jd, refYear);
  } else {
    yearPillar = getYearPillarLunar(gYear, gMonth, gDay, lunar.lunarYear);
    monthPillar = getMonthPillarLunar(lunar.lunarMonth, lunar.lunarYear);
  }

  let hourPillar = null;
  if (hourZhiIndex != null && hourZhiIndex >= 0 && hourZhiIndex <= 11) {
    hourPillar = getHourPillar(hourZhiIndex, dayPillar.gan);
  }

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    jd,
    lunar
  };
}

export function getPillarGanZhi(gan, zhi) {
  return (TIANGAN[gan] || '') + (DIZHI[zhi] || '');
}
