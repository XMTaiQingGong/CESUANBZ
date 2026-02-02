/**
 * 大运排盘：顺逆由性别决定，起运方式常用“节令差”或“下一个节/上一个节”
 */

import { TIANGAN, DIZHI } from './constants.js';

/** 六十甲子序 (0-59)：天干g 地支z → 序 = (g*6 - z*5 + 60) % 60 */
function pillarToIndex(gan, zhi) {
  return (gan * 6 - zhi * 5 + 60) % 60;
}

/** 序转干支 */
function indexToGanZhi(idx) {
  idx = (idx % 60 + 60) % 60;
  const gan = idx % 10;
  const zhi = idx % 12;
  return { gan, zhi };
}

/**
 * 大运：从月柱顺推或逆推，每柱管约 10 年（或按节令差折算）
 * @param {Object} opts - { yearPillar, monthPillar, gender: 'male'|'female', gYear, gMonth, gDay, jd }
 */
export function calcDaYun(opts) {
  const { yearPillar, monthPillar, gender, jd } = opts;
  if (!yearPillar || !monthPillar || !gender || jd == null) return null;
  const forward = gender === 'male';
  const monthIdx = pillarToIndex(monthPillar.gan, monthPillar.zhi);
  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const pillars = steps.map(step => {
    const next = (monthIdx + (forward ? step : -step) + 60) % 60;
    return indexToGanZhi(next);
  });
  return pillars.map((p, i) => ({
    index: i + 1,
    gan: p.gan,
    zhi: p.zhi,
    text: TIANGAN[p.gan] + DIZHI[p.zhi],
    ageHint: `约 ${(i + 1) * 10}-${(i + 2) * 10} 岁`
  }));
}
