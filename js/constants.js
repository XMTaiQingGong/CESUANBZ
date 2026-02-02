/**
 * 天干地支、藏干、十神、五行 常量与映射
 */

// 十天干 0-9
export const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 十二地支 0-11
export const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 天干五行 木火土金水
export const GAN_WUXING = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]; // 甲乙木 丙丁火 戊己土 庚辛金 壬癸水
export const WUXING_NAMES = ['木', '火', '土', '金', '水'];
// 地支五行
export const ZHI_WUXING = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4]; // 子水 丑土 寅木 ...
// 地支藏干（主气、中气、余气，-1 表示无）
export const ZHI_CANGGAN = [
  [9, -1, -1],   // 子 癸
  [5, 1, 9],     // 丑 己癸辛
  [0, 2, 4],     // 寅 甲丙戊
  [1, -1, -1],   // 卯 乙
  [4, 1, 9],     // 辰 戊乙癸
  [2, 4, 6],     // 巳 丙戊庚
  [3, -1, -1],   // 午 丁
  [5, 3, 7],     // 未 己丁乙
  [6, 4, 2],     // 申 庚戊壬
  [7, -1, -1],   // 酉 辛
  [4, 7, 5],     // 戌 戊辛丁
  [8, 6, 4],     // 亥 壬甲
];

// 十神（以日干为我）：0比肩 1劫财 2食神 3伤官 4偏财 5正财 6偏官 7正官 8偏印 9正印
export const SHISHEN_NAMES = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '偏官', '正官', '偏印', '正印'];
// 与我（日干）同阴阳为偏、异阴阳为正；生我为印，我生为食伤，克我为官杀，我克为财，同我为比劫
export function getShiShen(dayGan, otherGan) {
  const me = dayGan % 10;
  const other = otherGan % 10;
  const meYin = me % 2;   // 0阳 1阴
  const otherYin = other % 2;
  const sameYin = meYin === otherYin;
  const diff = (other - me + 10) % 10;
  if (diff === 0) return 0; // 比肩
  if (diff === 1) return sameYin ? 1 : 0; // 劫财 / 比肩
  if (diff === 2) return sameYin ? 2 : 3; // 食神 / 伤官
  if (diff === 3) return sameYin ? 3 : 2;
  if (diff === 4) return sameYin ? 4 : 5; // 偏财 / 正财
  if (diff === 5) return sameYin ? 5 : 4;
  if (diff === 6) return sameYin ? 6 : 7; // 偏官 / 正官
  if (diff === 7) return sameYin ? 7 : 6;
  if (diff === 8) return sameYin ? 8 : 9; // 偏印 / 正印
  if (diff === 9) return sameYin ? 9 : 8;
  return 0;
}

// 生肖
export const SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

export function getPillarGanZhi(ganIndex, zhiIndex) {
  return (TIANGAN[ganIndex] || '') + (DIZHI[zhiIndex] || '');
}

export function getCangGanText(zhiIndex) {
  const arr = ZHI_CANGGAN[zhiIndex];
  const names = arr.filter(i => i >= 0).map(i => TIANGAN[i]);
  return names.join('');
}
