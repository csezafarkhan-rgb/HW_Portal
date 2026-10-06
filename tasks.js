'use strict';
// Task board for a portal.
//
// Reads <slug>/tasks.json — a hand-maintained record of what is being worked on, what each job is
// waiting for and what happens next. Unlike the analyzers (which are generated from live pulls),
// this is written by whoever did the work, so it carries the detail a score cannot: why an import
// failed, what was ruled out, which file was used, what must not be done next.
const fs = require('node:fs');
const path = require('node:path');

const STATUS = {
  in_progress: ['In progress', 'warn'],
  blocked: ['Blocked', 'bad'],
  waiting: ['Waiting on Wayfair', 'warn'],
  not_started: ['Not started', 'none'],
  done: ['Done', 'good'],
};
const ORDER = ['in_progress', 'blocked', 'waiting', 'not_started', 'done'];
const PRIORITY = { high: 'High', medium: 'Medium', low: 'Low' };

function loadTasks(root, slug) {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(root, slug, 'tasks.json'), 'utf8'));
    if (Array.isArray(d.groups) && d.groups.length) return d;
  } catch { /* no board for this portal */ }
  return null;
}

function countTasks(d) {
  const out = { total: 0 };
  for (const k of ORDER) out[k] = 0;
  for (const g of d.groups) for (const t of g.tasks || []) {
    out.total++;
    if (out[t.status] !== undefined) out[t.status]++;
  }
  return out;
}

const CSS = `
.tkbanner{display:flex;align-items:center;gap:16px;text-decoration:none;color:var(--fg);background:var(--card);border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:10px;padding:14px 18px;margin:0 0 14px}
.tkbanner:hover{border-color:var(--accent);border-left-color:var(--accent)}
.tkbanner .tkb-main{flex:1;min-width:0}
.tkbanner strong{font-size:15.5px}
.tkbanner .muted{font-size:13.5px;margin-top:2px;line-height:1.5}
.tkbanner .tkb-go{color:var(--accent);font-size:13.5px;white-space:nowrap}
.tkpills{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}
.tkp{display:inline-flex;align-items:center;gap:6px;font-size:12px;padding:2px 9px;border:1px solid var(--line);border-radius:999px;color:var(--muted)}
.tkp .dot{box-shadow:none}.tkp .dot.none{background:var(--line)}
@media (max-width:620px){.tkbanner{flex-direction:column;align-items:flex-start;gap:8px}}
.tkfilters{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px}
.tkfilters button{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:13px;padding:4px 12px;border:1px solid var(--line);border-radius:999px;color:var(--fg);background:var(--card);cursor:pointer}
.tkfilters button:hover{border-color:var(--accent)}
.tkfilters button.on{border-color:var(--accent);color:var(--accent)}
.tkfilters .dot{box-shadow:none}.tkfilters .dot.none{background:var(--line)}
.tkgroup{margin:0 0 10px}
.tkgroup > h2{margin:26px 0 4px;font-size:17px}
.tkgroup .gblurb{color:var(--muted);font-size:14px;margin:0 0 12px}
.tk{border:1px solid var(--line);border-radius:10px;background:var(--card);margin:0 0 10px;overflow:hidden}
.tk[data-status="done"]{opacity:.78}
.tk > summary{display:flex;align-items:flex-start;gap:12px;padding:13px 16px;cursor:pointer;list-style:none}
.tk > summary::-webkit-details-marker{display:none}
.tk > summary:hover{background:rgba(127,127,127,.06)}
.tk .tkmain{flex:1;min-width:0}
.tk .tktitle{font-weight:600;font-size:15px;line-height:1.35}
.tk .tksum{color:var(--muted);font-size:13.5px;margin-top:3px;line-height:1.5}
.tk .caret{color:var(--muted);transition:transform .15s}
.tk[open] > summary .caret{transform:rotate(90deg)}
.tkbadges{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:7px}
.tkb{font-size:11.5px;padding:2px 8px;border-radius:999px;border:1px solid var(--line);color:var(--muted);white-space:nowrap}
.tkb.st{border-color:currentColor}
.tkb.good{color:var(--good)}.tkb.warn{color:var(--warn)}.tkb.bad{color:var(--bad)}.tkb.none{color:var(--muted)}
.tkb.hi{color:var(--bad);border-color:currentColor}
.tkbody{padding:0 16px 16px;border-top:1px solid var(--line)}
.tkbody h4{margin:16px 0 6px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:600}
.tkbody ul{margin:0;padding-left:20px}
.tkbody li{margin:4px 0;font-size:14px;line-height:1.55}
.tkbody p{font-size:14px;line-height:1.6;margin:0}
.tkres{background:rgba(127,127,127,.07);border-radius:8px;padding:10px 14px;font-size:14px;line-height:1.6}
.tkup{list-style:none;padding:0;margin:0}
.tkup li{display:flex;gap:12px;padding:5px 0;border-bottom:1px solid var(--line);font-size:13.5px;line-height:1.55}
.tkup li:last-child{border-bottom:0}
.tkup time{color:var(--muted);white-space:nowrap;font-variant-numeric:tabular-nums;min-width:66px}
.tkfiles{display:flex;flex-wrap:wrap;gap:6px}
.tkfiles code{font-size:12.5px;padding:2px 8px;border:1px solid var(--line);border-radius:6px}
.tklinks{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.tknext li{color:var(--fg)}
.tklearn{border:1px solid var(--line);border-radius:10px;padding:2px 16px 14px;background:var(--card);margin-top:10px}
.tklearn dt{font-weight:600;font-size:14px;margin:14px 0 3px}
.tklearn dd{margin:0;color:var(--muted);font-size:13.5px;line-height:1.6}
`;

const SCRIPT = `<script>
(function(){
  var bar = document.getElementById('tkfilters');
  if (!bar) return;
  bar.addEventListener('click', function(e){
    var b = e.target.closest('button');
    if (!b) return;
    var want = b.dataset.st || '';
    bar.querySelectorAll('button').forEach(function(x){ x.classList.toggle('on', x === b); });
    document.querySelectorAll('.tk').forEach(function(t){
      t.hidden = !!want && t.dataset.status !== want;
    });
    document.querySelectorAll('.tkgroup').forEach(function(g){
      g.hidden = !g.querySelector('.tk:not([hidden])');
    });
  });
  var ex = document.getElementById('tkexpand');
  if (ex) ex.addEventListener('click', function(){
    var open = ex.dataset.open === '1';
    document.querySelectorAll('.tk:not([hidden])').forEach(function(t){ t.open = !open; });
    ex.dataset.open = open ? '0' : '1';
    ex.textContent = open ? 'Expand all' : 'Collapse all';
  });
})();
</script>`;

function tasksPage(p, d, { escapeHtml, hero }) {
  const esc = escapeHtml;
  const list = (items, cls) => items && items.length
    ? `<ul${cls ? ` class="${cls}"` : ''}>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : '';

  const task = t => {
    const [label, cls] = STATUS[t.status] || ['Unknown', 'none'];
    const badges = [
      `<span class="tkb st ${cls}"><i class="dot ${cls}"></i> ${label}</span>`,
      t.priority ? `<span class="tkb${t.priority === 'high' ? ' hi' : ''}">${PRIORITY[t.priority] || esc(t.priority)} priority</span>` : '',
      t.owner ? `<span class="tkb">${esc(t.owner)}</span>` : '',
      t.due ? `<span class="tkb hi">Due ${esc(t.due)}</span>` : '',
      t.closed ? `<span class="tkb">Closed ${esc(t.closed)}</span>` : '',
    ].filter(Boolean).join('');

    const body = [
      t.result ? `<h4>Result</h4><div class="tkres">${esc(t.result)}</div>` : '',
      t.asks && t.asks.length ? `<h4>What we have asked for</h4>${list(t.asks)}` : '',
      t.pending && t.pending.length ? `<h4>Pending</h4>${list(t.pending)}` : '',
      t.next && t.next.length ? `<h4>Next</h4>${list(t.next, 'tknext')}` : '',
      t.evidence && t.evidence.length ? `<h4>Evidence</h4>${list(t.evidence)}` : '',
      t.updates && t.updates.length
        ? `<h4>Updates</h4><ul class="tkup">${t.updates.slice().reverse().map(u =>
            `<li><time>${esc(u.date)}</time><span>${esc(u.text)}</span></li>`).join('')}</ul>` : '',
      t.files && t.files.length
        ? `<h4>Files</h4><div class="tkfiles">${t.files.map(f => `<code>${esc(f)}</code>`).join('')}</div>` : '',
      t.links && t.links.length
        ? `<div class="tklinks">${t.links.map(l =>
            `<a class="btn ghost" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}</div>` : '',
    ].filter(Boolean).join('');

    return `<details class="tk" data-status="${esc(t.status)}" id="${esc(t.id || '')}">
  <summary><div class="tkmain"><div class="tktitle">${esc(t.title)}</div>
  ${t.summary ? `<div class="tksum">${esc(t.summary)}</div>` : ''}
  <div class="tkbadges">${badges}</div></div><span class="caret" aria-hidden="true">›</span></summary>
  ${body ? `<div class="tkbody">${body}</div>` : ''}
</details>`;
  };

  const groups = d.groups.map(g => `<section class="tkgroup">
  <h2>${esc(g.title)}</h2>
  ${g.blurb ? `<p class="gblurb">${esc(g.blurb)}</p>` : ''}
  ${(g.tasks || []).map(task).join('')}
</section>`).join('');

  const c = countTasks(d);
  const pills = ORDER.filter(k => c[k]).map(k =>
    `<button data-st="${k}"><i class="dot ${STATUS[k][1]}"></i>${STATUS[k][0]} <b>${c[k]}</b></button>`).join('');

  const open = c.in_progress + c.blocked + c.waiting + c.not_started;
  const learned = (d.learned || []).length
    ? `<h2>What we learned</h2><dl class="tklearn">${d.learned.map(l =>
        `<dt>${esc(l.title)}</dt><dd>${esc(l.text)}</dd>`).join('')}</dl>` : '';

  return `${hero(p, 'Current work — status, what is pending and what happens next')}
<p><a href="/${encodeURIComponent(p.slug)}/">← All ${esc(p.name)} analyzers</a></p>
<div class="summary"><div><strong>${open} open · ${c.done} done</strong>
<div class="muted">Everything currently in flight on Wayfair, with the full history of each job — what was tried, what it cost, what is still outstanding.${d.generated ? ` Updated ${esc(d.generated)}.` : ''}</div></div></div>
<div class="tkfilters" id="tkfilters"><button class="on" data-st="">All <b>${c.total}</b></button>${pills}</div>
<p class="muted dl-note"><button class="btn ghost" id="tkexpand" data-open="0">Expand all</button></p>
${groups}
${learned}
${SCRIPT}`;
}

module.exports = { loadTasks, tasksPage, countTasks, CSS };
