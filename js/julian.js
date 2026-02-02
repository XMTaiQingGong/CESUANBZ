/**
 * 儒略日与公历互转（用于日柱、节气等）
 */

export function gregorianToJD(y, m, d) {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5);
}

export function jdToGregorian(jd) {
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
