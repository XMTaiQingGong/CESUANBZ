/**
 * 二十四节气（节）— 用于八字月柱边界
 * 月令：寅=立春-惊蛰，卯=惊蛰-清明，辰=清明-立夏，巳=立夏-芒种，午=芒种-小暑，
 * 未=小暑-立秋，申=立秋-白露，酉=白露-寒露，戌=寒露-立冬，亥=立冬-大雪，子=大雪-小寒，丑=小寒-立春
 */

import { gregorianToJD } from './julian.js';

const TERM_NAMES = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];

// 各节在公历中的大致日期（以 2000 年为基准，月、日）；每年有约 ±1 日偏差，用世纪项修正
const TERM_BASE_2000 = [
  [2, 4], [3, 5], [4, 5], [5, 5], [6, 6], [7, 7], [8, 7], [9, 7], [10, 8], [11, 7], [12, 7], [1, 6]
];

// 节在年中顺序：小寒(1月)、立春(2月)、…、大雪(12月)。排序后 segment[i]→月令：小寒-立春=丑(1), 立春-惊蛰=寅(2), …
export const TERM_TO_MONTH_ZHI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];

/** 某年某节（0=立春, 1=惊蛰, ... 11=小寒）的儒略日（中午） */
export function getSolarTermJD(year, termIndex) {
  const t = termIndex % 12;
  const [m, d] = TERM_BASE_2000[t];
  const jd = gregorianToJD(year, m, d);
  const delta = (year - 2000) * 0.2422;
  const fix = Math.round(delta);
  return jd + fix;
}

/** 给定儒略日，返回当月令地支序 (0-11) 与节名称 */
export function getMonthZhiByJD(jd, year) {
  const terms = [];
  for (let i = 0; i < 12; i++) {
    terms.push(getSolarTermJD(year, i));
  }
  terms.sort((a, b) => a - b);
  for (let i = 0; i < 12; i++) {
    if (jd < terms[i]) {
      const seg = i === 0 ? 11 : i - 1;
      const termName = TERM_NAMES[(seg + 11) % 12];
      return { zhiIndex: TERM_TO_MONTH_ZHI[seg], termName };
    }
  }
  return { zhiIndex: TERM_TO_MONTH_ZHI[11], termName: TERM_NAMES[11] };
}

/** 立春所在儒略日（用于年界 模式A） */
export function getLiChunJD(year) {
  return getSolarTermJD(year, 0);
}

export { TERM_NAMES };
