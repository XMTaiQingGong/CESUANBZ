/**
 * 生辰八字 · 四柱排盘 — 主入口与 UI
 * 按信息密度分层输出：基础盘 → 进阶盘 → 深度盘
 */

import { lunarToGregorian, gregorianToLunar } from './lunar.js';
import { calcFourPillars, getPillarGanZhi } from './fourPillars.js';
import {
  TIANGAN, DIZHI, WUXING_NAMES, GAN_WUXING, ZHI_WUXING,
  getCangGanText, getShiShen, SHISHEN_NAMES, SHENGXIAO
} from './constants.js';
import { applyTrueSolarTime, hourMinuteToZhiIndex } from './trueSolarTime.js';
import { calcDaYun } from './dayun.js';
import { getMonthZhiByJD } from './solarTerms.js';

const form = document.getElementById('form');
const output = document.getElementById('output');
const dateTypeRadios = document.querySelectorAll('input[name="dateType"]');
const lunarOptions = document.getElementById('lunarOptions');
const densityTabs = document.querySelectorAll('.density-tabs .tab');
const btnLocate = document.getElementById('btnLocate');

let currentDensity = 1;
let lastExportData = null;

dateTypeRadios.forEach(r => {
  r.addEventListener('change', () => {
    lunarOptions.style.display = r.value === 'lunar' ? 'block' : 'none';
  });
});

densityTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    densityTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentDensity = parseInt(tab.dataset.density, 10);
    document.body.classList.remove('density-2', 'density-3');
    if (currentDensity >= 2) document.body.classList.add('density-2');
    if (currentDensity >= 3) document.body.classList.add('density-3');
  });
});

btnLocate.addEventListener('click', () => {
  if (!navigator.geolocation) {
    output.innerHTML = '<p class="placeholder">当前浏览器不支持定位</p>';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      document.getElementById('location').value = `经度 ${lon.toFixed(4)}° 纬度 ${lat.toFixed(4)}°`;
      document.getElementById('location').dataset.longitude = String(lon);
    },
    () => { document.getElementById('location').placeholder = '定位失败，可手动输入城市或经度'; }
  );
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const dateType = fd.get('dateType');
  let gYear = parseInt(fd.get('year'), 10);
  let gMonth = parseInt(fd.get('month'), 10);
  let gDay = parseInt(fd.get('day'), 10);
  const isLeapMonth = fd.get('isLeapMonth') === 'on';

  if (dateType === 'lunar') {
    const lunar = lunarToGregorian(gYear, gMonth, gDay, isLeapMonth);
    if (!lunar) {
      output.innerHTML = '<p class="placeholder">农历日期无效或超出 1900-2100 范围</p>';
      return;
    }
    gYear = lunar.year;
    gMonth = lunar.month;
    gDay = lunar.day;
  }

  let hourZhiIndex = null;
  const hourSelect = document.getElementById('hour');
  const hourMin = document.getElementById('hourMin').value;
  const minute = document.getElementById('minute').value;
  const useTrueSolar = document.getElementById('useTrueSolar').checked;
  const locationInput = document.getElementById('location');
  let longitude = parseFloat(locationInput.dataset.longitude);
  if (!longitude && locationInput.value) {
    const m = locationInput.value.match(/经度\s*([-\d.]+)/);
    if (m) longitude = parseFloat(m[1]);
  }

  if (hourSelect.value !== '') {
    hourZhiIndex = parseInt(hourSelect.value, 10);
  } else if (hourMin !== '' || minute !== '') {
    let h = parseInt(hourMin, 10) || 0;
    let m = parseInt(minute, 10) || 0;
    if (useTrueSolar && longitude != null && !isNaN(longitude)) {
      const corrected = applyTrueSolarTime(h, m, longitude);
      h = corrected.hour;
      m = corrected.minute;
    }
    hourZhiIndex = hourMinuteToZhiIndex(h, m);
  }

  const yearMode = fd.get('yearMode') || 'solar';
  const lunarInput = dateType === 'lunar'
    ? { lunarYear: parseInt(fd.get('year'), 10), lunarMonth: parseInt(fd.get('month'), 10), lunarDay: parseInt(fd.get('day'), 10), isLeapMonth: !!isLeapMonth }
    : null;

  const pillars = calcFourPillars({
    gYear, gMonth, gDay,
    hourZhiIndex,
    yearMode,
    ...(lunarInput ? lunarInput : {})
  });

  const name = fd.get('name') || '';
  const gender = fd.get('gender') || '';
  const density = currentDensity;
  const address = document.getElementById('location').value || '';
  const birthDateStr = dateType === 'lunar'
    ? `农历 ${fd.get('year')}年${fd.get('month')}月${fd.get('day')}日${isLeapMonth ? '（闰月）' : ''}`
    : `公历 ${gYear}年${gMonth}月${gDay}日`;

  renderOutput({ pillars, name, gender, density, useTrueSolar, longitude, gYear, gMonth, gDay });
  lastExportData = {
    name,
    birthDate: birthDateStr,
    pillars,
    address
  };
});

function renderOutput({ pillars, name, gender, density, useTrueSolar, longitude, gYear, gMonth, gDay }) {
  const { year, month, day, hour, lunar, jd } = pillars;
  const dayGan = day.gan;
  const dayZhi = day.zhi;

  let html = '';
  if (name) html += `<p><strong>${escapeHtml(name)}</strong></p>`;

  html += '<h3>四柱</h3>';
  const yearZhi = year.zhi;
  const sx = SHENGXIAO[yearZhi];
  html += '<div class="pillars">';
  html += pillarBox('年', year, lunar ? `农历 ${lunar.lunarYear}年 · ${sx}` : sx);
  html += pillarBox('月', month);
  html += pillarBox('日', day);
  html += hour ? pillarBox('时', hour) : pillarBox('时', null, '未知');
  html += '</div>';

  html += '<h3>地支藏干</h3>';
  html += '<div class="table-wrap"><table><thead><tr><th>柱</th><th>藏干</th></tr></thead><tbody>';
  [[year, '年'], [month, '月'], [day, '日'], hour ? [hour, '时'] : null].filter(Boolean).forEach(([p, label]) => {
    if (!p) return;
    html += `<tr><td>${label} ${getPillarGanZhi(p.gan, p.zhi)}</td><td>${getCangGanText(p.zhi)}</td></tr>`;
  });
  html += '</tbody></table></div>';

  html += '<h3>十神（以日主为中心）</h3>';
  html += '<div class="table-wrap"><table><thead><tr><th>柱</th><th>天干</th><th>十神</th></tr></thead><tbody>';
  [[year, '年'], [month, '月'], [day, '日'], hour ? [hour, '时'] : null].filter(Boolean).forEach(([p, label]) => {
    if (!p) return;
    const ss = getShiShen(dayGan, p.gan);
    html += `<tr><td>${label}</td><td>${TIANGAN[p.gan]}</td><td>${SHISHEN_NAMES[ss]}</td></tr>`;
  });
  html += '</tbody></table></div>';

  const wuxingCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  [year, month, day, hour].filter(Boolean).forEach(p => {
    wuxingCount[GAN_WUXING[p.gan]] = (wuxingCount[GAN_WUXING[p.gan]] || 0) + 1;
    wuxingCount[ZHI_WUXING[p.zhi]] = (wuxingCount[ZHI_WUXING[p.zhi]] || 0) + 1;
  });
  html += '<h3>五行分布（柱干支统计）</h3><p>';
  WUXING_NAMES.forEach((name, i) => {
    html += `${name} ${wuxingCount[i] || 0} `;
  });
  html += '</p>';

  if (density >= 2) {
    if (useTrueSolar && longitude != null) {
      html += '<h3>真太阳时</h3><p>已按经度 ' + longitude.toFixed(2) + '° 做时间校正（东早西晚）。</p>';
    }
    const { termName } = getMonthZhiByJD(jd, gYear);
    html += '<h3>格局/旺衰提示</h3><p>当前月令为节气「' + termName + '」区间。旺衰与喜忌因流派不同会有差异，此处仅作文化解释。</p>';
  }

  if (density >= 3 && gender) {
    const daYun = calcDaYun({
      yearPillar: year,
      monthPillar: month,
      gender,
      jd
    });
    if (daYun && daYun.length) {
      html += '<h3>大运（约 10 年一柱）</h3><div class="table-wrap"><table><thead><tr><th>步</th><th>干支</th><th>年龄参考</th></tr></thead><tbody>';
      daYun.forEach(d => {
        html += `<tr><td>${d.index}</td><td>${d.text}</td><td>${d.ageHint}</td></tr>`;
      });
      html += '</tbody></table></div>';
    }
    html += '<h3>流年与冲合</h3><p>流年与冲合刑害仅作文化解释，具体宜忌请以专业派别为准。</p>';
  }

  html += '<p class="disclaimer">本结果仅供传统文化学习与娱乐，流派不同结论会有差异。</p>';
  html += '<div class="export-actions"><button type="button" id="btnExport" class="btn primary">导出 Excel</button></div>';
  output.innerHTML = html;

  document.getElementById('btnExport').addEventListener('click', () => {
    if (lastExportData) exportToExcel(lastExportData);
    else output.querySelector('.placeholder')?.insertAdjacentHTML('afterend', '<p class="hint">请先完成排盘</p>');
  });
}

function pillarBox(label, pillar, extra) {
  if (!pillar) {
    return `<div class="pillar-box"><span class="name">${label}柱</span><span class="ganzhi">${extra || '—'}</span></div>`;
  }
  const gz = getPillarGanZhi(pillar.gan, pillar.zhi);
  const detail = getCangGanText(pillar.zhi) + (extra ? ' · ' + extra : '');
  return `<div class="pillar-box"><span class="name">${label}柱</span><span class="ganzhi">${gz}</span><span class="detail">${detail}</span></div>`;
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function exportToExcel(data) {
  const pillarsStr = [
    getPillarGanZhi(data.pillars.year.gan, data.pillars.year.zhi),
    getPillarGanZhi(data.pillars.month.gan, data.pillars.month.zhi),
    getPillarGanZhi(data.pillars.day.gan, data.pillars.day.zhi),
    data.pillars.hour ? getPillarGanZhi(data.pillars.hour.gan, data.pillars.hour.zhi) : '未知'
  ].join(' ');
  const row = [
    data.name || '',
    data.birthDate || '',
    pillarsStr,
    data.address || ''
  ];
  const BOM = '\uFEFF';
  const headers = ['姓名', '出生日期', '八字信息', '地址'];
  const csv = BOM + headers.map(h => `"${h}"`).join(',') + '\n' + row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',') + '\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '八字排盘记录.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

form.addEventListener('reset', () => {
  setTimeout(() => {
    output.innerHTML = '<p class="placeholder">填写出生信息后点击「排盘」</p>';
    lastExportData = null;
  }, 0);
});
