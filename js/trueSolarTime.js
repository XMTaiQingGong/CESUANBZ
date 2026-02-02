/**
 * 真太阳时校正：根据经度将平太阳时转为真太阳时
 * 每度经差约 4 分钟，东经早、西经晚
 */

/** 经度 longitude（度），返回 分钟 校正量（加在地方平太阳时上） */
export function trueSolarOffsetMinutes(longitude) {
  const refLongitude = 120;
  return (longitude - refLongitude) * 4;
}

/** 将 时:分 加上 真太阳时 校正，返回 { hour, minute }（0-23, 0-59） */
export function applyTrueSolarTime(hour, minute, longitude) {
  const offset = trueSolarOffsetMinutes(longitude);
  let totalMinutes = hour * 60 + minute + offset;
  totalMinutes = totalMinutes % (24 * 60);
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  return {
    hour: Math.floor(totalMinutes / 60) % 24,
    minute: Math.floor(totalMinutes % 60)
  };
}

/** 根据校正后的 时:分 得到时辰地支序 (0-11)：子 23-1, 丑 1-3, ... */
export function hourMinuteToZhiIndex(hour, minute) {
  let totalMinutes = hour * 60 + minute;
  totalMinutes = totalMinutes % (24 * 60);
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  const segment = Math.floor(totalMinutes / 120);
  return segment % 12;
}
