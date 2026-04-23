# -*- coding: utf-8 -*-
"""
觸控筆數據分析系統 v2
書寫 → 按「送出並分析」→ 圖表直接在同一頁展開
"""

from flask import Flask, render_template_string, request, jsonify
import csv, os
from datetime import datetime

app = Flask(__name__)
os.makedirs("data", exist_ok=True)

HTML = r"""<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<title>觸控筆數據分析</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:     #f6f5f2;
  --card:   #ffffff;
  --border: #e4e2db;
  --text:   #1a1917;
  --muted:  #8a8880;
  --blue:   #2563eb;
  --green:  #16a34a;
  --amber:  #d97706;
  --red:    #dc2626;
  --font:   'DM Sans', system-ui, sans-serif;
  --mono:   'DM Mono', monospace;
}
html, body { min-height: 100vh; background: var(--bg); color: var(--text); font-family: var(--font); }

/* ── TOP BAR ── */
.topbar {
  height: 54px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; padding: 0 28px; gap: 14px;
  background: var(--card); position: sticky; top: 0; z-index: 20;
}
.logo { font-size: 14px; font-weight: 600; letter-spacing: -.02em; }
.logo span { color: var(--muted); font-weight: 400; }
.topbar-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: #d1d0cb; transition: background .25s; }
.dot.live { background: #22c55e; }
.dot.done { background: var(--blue); }
.status-txt { font-size: 12px; color: var(--muted); font-family: var(--mono); }

/* ── PAGE ── */
.page { max-width: 1080px; margin: 0 auto; padding: 32px 24px 80px; }

/* ── WRITING CARD ── */
.write-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 16px; overflow: hidden; margin-bottom: 32px;
}
.write-card.writing { outline: 2px solid var(--text); }

.write-header {
  padding: 14px 20px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.write-title { font-size: 13px; font-weight: 500; }
.device-tag {
  font-size: 11px; padding: 3px 10px; border-radius: 20px;
  background: var(--bg); color: var(--muted); font-family: var(--mono);
}

canvas#drawing {
  display: block; width: 100%; height: 300px;
  cursor: crosshair; touch-action: none; background: var(--card);
}

.live-strip {
  padding: 10px 20px; border-top: 1px solid var(--border);
  min-height: 42px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.chip {
  font-size: 11px; padding: 3px 10px; border-radius: 20px;
  background: var(--bg); color: var(--muted); font-family: var(--mono);
}
.chip b { color: var(--text); }

.write-footer {
  padding: 12px 20px; border-top: 1px solid var(--border);
  display: flex; align-items: center; gap: 10px;
}
.pts-count { font-size: 12px; color: var(--muted); font-family: var(--mono); margin-right: auto; }

/* ── BUTTONS ── */
button {
  font-family: var(--font); font-size: 13px; font-weight: 500;
  padding: 9px 20px; border-radius: 8px; border: 1px solid var(--border);
  background: transparent; color: var(--text); cursor: pointer; transition: all .15s;
}
button:hover:not(:disabled) { background: var(--bg); }
button:disabled { opacity: .35; cursor: not-allowed; }
.btn-submit {
  background: var(--text); color: var(--bg);
  border-color: transparent; padding: 9px 28px;
}
.btn-submit:hover:not(:disabled) { opacity: .85; background: var(--text); }

/* ── DASHBOARD ── */
#dashboard { display: none; }
#dashboard.visible {
  display: block;
  animation: fadeUp .4s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.dash-header { display: flex; align-items: baseline; gap: 14px; margin-bottom: 22px; }
.dash-title { font-size: 22px; font-weight: 600; letter-spacing: -.03em; }
.dash-meta { font-size: 12px; color: var(--muted); font-family: var(--mono); }

/* ── STATS ── */
.stat-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px; margin-bottom: 20px;
}
.stat {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 12px; padding: 14px 16px;
}
.stat-val { font-size: 26px; font-weight: 600; letter-spacing: -.04em; line-height: 1; }
.stat-key { font-size: 10px; color: var(--muted); margin-top: 5px; text-transform: uppercase; letter-spacing: .07em; }

/* ── CHART GRID ── */
.chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
@media (max-width: 600px) { .chart-grid { grid-template-columns: 1fr; } }

.chart-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 12px; padding: 16px 18px;
}
.chart-label {
  font-size: 10px; font-weight: 600; color: var(--muted);
  letter-spacing: .1em; text-transform: uppercase; margin-bottom: 12px;
}

/* ── SAVE ROW ── */
.save-row { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
.save-msg { font-size: 12px; color: var(--green); font-family: var(--mono); }
</style>
</head>
<body>

<div class="topbar">
  <div class="logo">觸控筆分析 <span>/ 數據擷取系統</span></div>
  <div class="topbar-right">
    <span class="dot" id="dot"></span>
    <span class="status-txt" id="statusTxt">等待書寫</span>
  </div>
</div>

<div class="page">

  <!-- ─── 書寫區 ─── -->
  <div class="write-card" id="writeCard">
    <div class="write-header">
      <span class="write-title">書寫畫布</span>
      <span class="device-tag" id="deviceTag">未偵測到裝置</span>
    </div>

    <canvas id="drawing"></canvas>

    <div class="live-strip" id="liveStrip">
      <span class="chip">在畫布上開始書寫，寫完後按「送出並分析」</span>
    </div>

    <div class="write-footer">
      <span class="pts-count" id="ptsCount">0 點</span>
      <button onclick="clearAll()">清除重寫</button>
      <button class="btn-submit" id="submitBtn" onclick="submitAndRender()" disabled>送出並分析</button>
    </div>
  </div>

  <!-- ─── 分析儀表板（送出後才顯示）─── -->
  <div id="dashboard">

    <div class="dash-header">
      <div class="dash-title">分析結果</div>
      <div class="dash-meta" id="dashMeta"></div>
    </div>

    <div class="stat-row" id="statRow"></div>

    <!-- Row 1: 筆壓 -->
    <div class="chart-grid">
      <div class="chart-card">
        <div class="chart-label">筆壓時序</div>
        <div style="position:relative;height:160px">
          <canvas id="cPLine" role="img" aria-label="筆壓時序折線圖"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-label">筆壓頻率分布</div>
        <div style="position:relative;height:160px">
          <canvas id="cPHist" role="img" aria-label="筆壓頻率分布直方圖"></canvas>
        </div>
      </div>
    </div>

    <!-- Row 2: 速度 -->
    <div class="chart-grid">
      <div class="chart-card">
        <div class="chart-label">書寫速度時序</div>
        <div style="position:relative;height:160px">
          <canvas id="cSLine" role="img" aria-label="書寫速度時序折線圖"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-label">速度 × 筆壓 散點</div>
        <div style="position:relative;height:160px">
          <canvas id="cScatter" role="img" aria-label="速度與筆壓散點圖"></canvas>
        </div>
      </div>
    </div>

    <!-- Row 3: 傾斜 -->
    <div class="chart-grid">
      <div class="chart-card">
        <div class="chart-label">X / Y 傾斜角時序</div>
        <div style="position:relative;height:160px">
          <canvas id="cTLine" role="img" aria-label="傾斜角時序折線圖"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-label">傾斜方向分布（雷達）</div>
        <div style="position:relative;height:160px">
          <canvas id="cTRadar" role="img" aria-label="傾斜方向雷達圖"></canvas>
        </div>
      </div>
    </div>

    <div class="save-row">
      <button onclick="saveCSV()">儲存為 CSV</button>
      <span class="save-msg" id="saveMsg"></span>
    </div>

  </div>
</div>

<script>
// ─── 畫布初始化 ───
const canvas = document.getElementById('drawing');
const ctx    = canvas.getContext('2d');
let isDrawing = false, allPoints = [], chartInst = {};

function initCanvas() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
window.addEventListener('resize', initCanvas);
setTimeout(initCanvas, 60);

// ─── Pointer Events ───
canvas.addEventListener('pointerdown', e => {
  isDrawing = true;
  ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY);
  document.getElementById('writeCard').classList.add('writing');
  document.getElementById('dot').className = 'dot live';
  document.getElementById('statusTxt').textContent = '書寫中...';
  record(e);
});
canvas.addEventListener('pointermove', e => {
  if (!isDrawing) return;
  ctx.lineWidth   = e.pointerType === 'pen' ? e.pressure * 14 + 0.5 : 2.5;
  ctx.lineCap     = 'round';
  ctx.strokeStyle = '#1a1917';
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  record(e);
});
canvas.addEventListener('pointerup',  e => { if (isDrawing) { record(e); endStroke(); } });
canvas.addEventListener('pointerout', e => { if (isDrawing) { record(e); endStroke(); } });

function record(e) {
  allPoints.push({ x: e.offsetX, y: e.offsetY, t: Date.now(),
    pressure: e.pressure, tiltX: e.tiltX, tiltY: e.tiltY, type: e.pointerType });
  const devMap = { pen:'觸控筆', touch:'手指觸控', mouse:'滑鼠' };
  document.getElementById('deviceTag').textContent = devMap[e.pointerType] || e.pointerType;
  document.getElementById('liveStrip').innerHTML =
    `<span class="chip">X <b>${Math.round(e.offsetX)}</b></span>` +
    `<span class="chip">Y <b>${Math.round(e.offsetY)}</b></span>` +
    `<span class="chip">筆壓 <b>${e.pressure.toFixed(2)}</b></span>` +
    `<span class="chip">tiltX <b>${e.tiltX}°</b></span>` +
    `<span class="chip">tiltY <b>${e.tiltY}°</b></span>`;
  document.getElementById('ptsCount').textContent = allPoints.length + ' 點';
}

function endStroke() {
  isDrawing = false;
  document.getElementById('writeCard').classList.remove('writing');
  document.getElementById('dot').className = 'dot';
  document.getElementById('statusTxt').textContent = allPoints.length + ' 點已記錄';
  document.getElementById('submitBtn').disabled = allPoints.length < 3;
}

// ─── 清除 ───
function clearAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  allPoints = [];
  document.getElementById('liveStrip').innerHTML = '<span class="chip">在畫布上開始書寫，寫完後按「送出並分析」</span>';
  document.getElementById('deviceTag').textContent = '未偵測到裝置';
  document.getElementById('statusTxt').textContent = '等待書寫';
  document.getElementById('dot').className = 'dot';
  document.getElementById('ptsCount').textContent = '0 點';
  document.getElementById('submitBtn').disabled = true;
  document.getElementById('saveMsg').textContent = '';
  document.getElementById('dashboard').classList.remove('visible');
  Object.values(chartInst).forEach(c => c && c.destroy()); chartInst = {};
}

// ─── 送出並渲染圖表 ───
function submitAndRender() {
  if (allPoints.length < 3) return;
  Object.values(chartInst).forEach(c => c && c.destroy()); chartInst = {};

  const pts = allPoints, n = pts.length;

  // 筆壓
  const pArr = pts.map(p => p.pressure);
  const avgP = avg(pArr).toFixed(3);
  const maxP = Math.max(...pArr).toFixed(3);

  // 速度
  const speeds = [];
  for (let i = 1; i < n; i++) {
    const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
    const dt = Math.max(1, pts[i].t - pts[i-1].t);
    speeds.push(Math.min(Math.sqrt(dx*dx + dy*dy) / dt * 100, 300));
  }
  const avgS = speeds.length ? avg(speeds).toFixed(1) : '—';

  // 傾斜
  const txArr = pts.map(p => p.tiltX);
  const tyArr = pts.map(p => p.tiltY);

  // 統計卡
  document.getElementById('statRow').innerHTML = [
    [n,            '數據點'],
    [avgP,         '平均筆壓'],
    [maxP,         '最大筆壓'],
    [avgS,         '平均速度'],
    [avg(txArr).toFixed(1) + '°', 'X 軸傾斜'],
    [avg(tyArr).toFixed(1) + '°', 'Y 軸傾斜'],
  ].map(([v,k]) => `<div class="stat"><div class="stat-val">${v}</div><div class="stat-key">${k}</div></div>`).join('');

  document.getElementById('dashMeta').textContent =
    new Date().toLocaleString('zh-TW') + '　' + document.getElementById('deviceTag').textContent;

  // ── 圖表 1：筆壓時序 ──
  const sp = sub(pArr, 160);
  chartInst.pLine = mkLine('cPLine', sp, '#2563eb', true, { min:0, max:1 });

  // ── 圖表 2：筆壓分布 ──
  const buckets = new Array(10).fill(0);
  pArr.forEach(p => { buckets[Math.min(9, Math.floor(p * 10))]++; });
  chartInst.pHist = new Chart(document.getElementById('cPHist'), {
    type: 'bar',
    data: { labels: ['0','0.1','0.2','0.3','0.4','0.5','0.6','0.7','0.8','0.9'],
      datasets: [{ data: buckets, backgroundColor: '#2563eb44', borderColor: '#2563eb', borderWidth: 1.5 }] },
    options: base()
  });

  // ── 圖表 3：速度時序 ──
  chartInst.sLine = mkLine('cSLine', sub(speeds, 160), '#16a34a', true);

  // ── 圖表 4：速度×筆壓 散點 ──
  chartInst.scatter = new Chart(document.getElementById('cScatter'), {
    type: 'scatter',
    data: { datasets: [{ data: speeds.slice(0,200).map((s,i) =>
      ({ x: +((pts[i+1]?.pressure)||0).toFixed(3), y: +s.toFixed(1) })),
      backgroundColor: '#16a34a88', pointRadius: 3 }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
      scales: { x:{title:{display:true,text:'筆壓',font:{size:10}},min:0,max:1,ticks:{font:{size:10}}},
                y:{title:{display:true,text:'速度',font:{size:10}},ticks:{font:{size:10}}} } }
  });

  // ── 圖表 5：傾斜時序 ──
  const stx = sub(txArr, 120), sty = sub(tyArr, 120);
  chartInst.tLine = new Chart(document.getElementById('cTLine'), {
    type: 'line',
    data: { labels: stx.map((_,i)=>i), datasets: [
      { label:'X傾斜', data:stx, borderColor:'#d97706', pointRadius:0, borderWidth:1.5, tension:.3 },
      { label:'Y傾斜', data:sty, borderColor:'#dc2626', pointRadius:0, borderWidth:1.5, tension:.3, borderDash:[5,3] }
    ]},
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:true,labels:{font:{size:10},boxWidth:14}}},
      scales:{ x:{display:false}, y:{ticks:{font:{size:10}}} } }
  });

  // ── 圖表 6：傾斜雷達 ──
  const dirs = new Array(8).fill(0);
  pts.forEach(p => {
    const a = Math.atan2(p.tiltY, p.tiltX) * 180 / Math.PI;
    dirs[Math.floor(((a + 180) % 360) / 45) % 8]++;
  });
  chartInst.tRadar = new Chart(document.getElementById('cTRadar'), {
    type: 'radar',
    data: { labels:['E','NE','N','NW','W','SW','S','SE'], datasets:[{
      data:dirs, backgroundColor:'#d9740622', borderColor:'#d97706', borderWidth:1.5, pointRadius:3
    }]},
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
      scales:{r:{ticks:{font:{size:9},backdropColor:'transparent'},pointLabels:{font:{size:10}}}} }
  });

  // 顯示儀表板並滾動過去
  const dash = document.getElementById('dashboard');
  dash.classList.add('visible');
  setTimeout(() => dash.scrollIntoView({ behavior:'smooth', block:'start' }), 50);

  document.getElementById('dot').className = 'dot done';
  document.getElementById('statusTxt').textContent = '分析完成';
}

// ─── 儲存 CSV ───
function saveCSV() {
  if (!allPoints.length) return;
  fetch('/save', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ points: allPoints })
  }).then(r => r.json()).then(d => {
    document.getElementById('saveMsg').textContent = `✓ 已儲存 ${d.filename}（${d.count} 點）`;
  }).catch(() => {
    document.getElementById('saveMsg').textContent = '✗ 儲存失敗';
  });
}

// ─── 工具 ───
function avg(arr)   { return arr.reduce((a,b) => a+b, 0) / arr.length; }
function sub(arr, n){ if (arr.length <= n) return arr; const s = arr.length/n; return Array.from({length:n},(_,i)=>arr[Math.floor(i*s)]); }
function base()     { return { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{display:false},y:{ticks:{font:{size:10}}}} }; }
function mkLine(id, data, color, fill=false, yOpt={}) {
  const o = base(); if (Object.keys(yOpt).length) o.scales.y = {...o.scales.y, ...yOpt};
  return new Chart(document.getElementById(id), {
    type:'line', data:{ labels:data.map((_,i)=>i), datasets:[{
      data, borderColor:color, backgroundColor:color+'22',
      borderWidth:1.5, pointRadius:0, fill, tension:.3
    }]}, options:o
  });
}
</script>
</body>
</html>"""


@app.route('/')
def index():
    return render_template_string(HTML)


@app.route('/save', methods=['POST'])
def save():
    points = request.json.get('points', [])
    fname  = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    fpath  = os.path.join('data', fname)
    with open(fpath, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=['x','y','t','pressure','tiltX','tiltY','type'])
        w.writeheader(); w.writerows(points)
    print(f"[儲存] {fname}  ({len(points)} 點)")
    return jsonify({'status':'ok', 'filename':fname, 'count':len(points)})


if __name__ == '__main__':
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80)); local_ip = s.getsockname()[0]; s.close()
    except Exception:
        local_ip = '127.0.0.1'
    print("=" * 50)
    print("✅  伺服器啟動成功！")
    print(f"   本機:      http://127.0.0.1:5000")
    print(f"   區域網路:  http://{local_ip}:5000")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=False)
