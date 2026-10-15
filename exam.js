/* DHS English Studio — Exam Papers: real school papers, marked against the official answer key.
   First attempt is locked and kept; the rewrite is compared with it. Records stay in this browser. */
(() => {
  const P = EXAM_AURORA, KEY = "dhsExamV1", RULES = P.version;
  const root = document.querySelector("#exam-root");
  if (!root) return;
  let st = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })();
  st.aurora = st.aurora || { q: {}, lang: null };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* ignore */ } };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const wcount = t => (String(t || "").match(/\S+/g) || []).length;
  const rec = id => (st.aurora.q[id] = st.aurora.q[id] || {});
  let pdfUrl = null, timer = null, left = P.minutes * 60;

  const allQs = P.questions.concat([{ id: "q7", no: "7", marks: 15, tag: "", kind: "Summary · paragraphs 4–6" }]);
  const run = (q, text) => q.id === "q7" ? P.markSummary(text) : q.mark(text);
  const fmt = r => (r ? `${r.score} / ${r.max}` : "–");

  function markCard(r, title, q7) {
    const pts = r.points.map(p => `<li class="${p.got ? "ok" : "no"}"><b>${p.got ? "✓" : "✗"}</b> ${esc(p.desc)}${p.got ? "" : `<div class="why">${esc(p.feedback)}</div>`}</li>`).join("");
    const errs = r.errors.map(e => `<li>${esc(e)}</li>`).join("");
    return `<div class="mark-card"><h4>${esc(title)}: <span class="big">${r.score} / ${r.max}</span>${q7 ? ` <small>(content points only · language 5 marks by tutor)</small>` : ""}</h4><ul class="pts">${pts}</ul>${errs ? `<div class="fix-note"><b>Check:</b><ul>${errs}</ul></div>` : ""}<p class="est">Estimate by rules v${RULES}. A tutor can overrule it.</p></div>`;
  }

  function questionCard(q) {
    const r = rec(q.id), done = !!r.first, is7 = q.id === "q7";
    const chip = `<span class="type-chip">${q.tag ? "School tag " + q.tag + " · " : ""}${esc(q.kind)}</span> <span class="marks-chip">[${q.marks}]</span>`;
    const stem = is7 ? `Using your own words as far as possible, summarise the different beliefs various cultures had about the auroras. Use only paragraphs 4–6. Continuous writing, no more than 80 words (the opening is not counted).` : esc(q.stem);
    let html = `<article class="panel exam-q" id="eq-${q.id}"><div class="panel-head"><div><p class="eyebrow">QUESTION ${q.no}</p>${chip}</div></div><p class="q-stem">${stem}</p>`;
    if (!done) {
      html += `<details class="strategy"><summary>Before you write: how to read this question</summary><p>${esc(is7 ? "Find one belief per group in paragraphs 4–6. For each: WHO believed WHAT. Change the words, but keep the key idea. Name the group each time." : q.strategy)}</p></details>`;
      html += is7 ? `<p class="opening"><b>${esc(P.summaryOpening)}</b> …</p>` : "";
      html += `<textarea data-q="${q.id}" rows="${is7 ? 8 : q.marks > 1 ? 3 : 2}" placeholder="${is7 ? "Continue the sentence…" : "Write your answer here"}"></textarea>`;
      html += `<div class="form-actions"><p class="note">${is7 ? `<span class="wc" id="wc-q7">0</span> / 80 words · ` : ""}You will see your score and what you lost straight away. Your first score is kept.</p><button class="primary-btn" data-act="submit" data-q="${q.id}">Submit answer →</button></div>`;
    } else {
      html += `<p class="your"><b>Your answer</b>${is7 ? ` (${r.first.r.wc || wcount(r.first.text)} words)` : ""}<br>${is7 ? `<i>${esc(P.summaryOpening)}</i> ` : ""}${esc(r.first.text)}</p>`;
      html += markCard(r.first.r, "First attempt", is7);
      html += `<div class="model-card"><h4>Official answer</h4><p>${esc(q.model || "")}</p>${q.why ? `<p class="small">${esc(q.why)}</p>` : ""}</div>`;
      if (is7) html += `<div class="model-card"><h4>Official model summary</h4><p>${esc(P.modelSummary)}</p></div>`;
      const lost = r.first.r.points.filter(p => !p.got);
      if (lost.length || r.first.r.errors.length) {
        if (!r.retry) {
          html += `<div class="retry-card"><h4>Rewrite the points you lost</h4><div class="fix-note"><ul>${lost.map(p => `<li>${esc(p.feedback)}</li>`).join("")}</ul></div><textarea data-q="${q.id}" data-retry="1" rows="${is7 ? 8 : 3}" placeholder="Rewrite your answer…">${esc(r.first.text)}</textarea><div class="form-actions"><p class="note">${is7 ? `<span class="wc" id="wc-q7r">0</span> / 80 words` : ""}</p><button class="primary-btn" data-act="retry" data-q="${q.id}">Check my rewrite →</button></div></div>`;
        } else {
          html += markCard(r.retry.r, "Rewrite", is7);
          html += `<p class="compare-line">First attempt <b>${fmt(r.first.r)}</b> → rewrite <b>${fmt(r.retry.r)}</b> <span>(the first score is the one that counts in your record)</span></p>`;
        }
      }
      if (is7) {
        html += `<div class="lang-box"><label>Language marks (0–5, tutor)</label> <input type="number" min="0" max="5" id="lang-in" value="${st.aurora.lang == null ? "" : st.aurora.lang}" placeholder="–"> <small>Spelling, punctuation and grammar may be penalised on this paper.</small></div>`;
      }
    }
    return html + "</article>";
  }

  function totals() {
    let got = 0, max = 0, answered = 0;
    allQs.forEach(q => { const f = rec(q.id).first; max += q.id === "q7" ? 10 : q.marks; if (f) { answered++; got += f.r.score; } });
    return { got, max, answered, n: allQs.length };
  }

  function paperBar() {
    const t = totals(), lang = st.aurora.lang;
    const total = t.got + (lang == null ? 0 : lang);
    return `<div class="panel exam-head"><div><p class="eyebrow">REAL PAPER · SECTION C · ${P.total} MARKS · ${P.minutes} MIN</p><h2>${esc(P.title)}</h2><p class="small">First-attempt score so far: <b>${t.got} / ${t.max}</b> (${t.answered} of ${t.n} questions)${lang == null ? "" : ` · with language ${lang}/5: <b>${total} / ${P.total}</b>`}</p></div><div class="exam-tools"><span class="timer" id="exam-timer">${fmtTime(left)}</span><button class="small-btn" data-act="timer">${timer ? "Stop timer" : "Start 50-minute timer"}</button></div></div>`;
  }
  const fmtTime = s => `${String(Math.floor(Math.abs(s) / 60)).padStart(2, "0")}:${String(Math.abs(s) % 60).padStart(2, "0")}${s < 0 ? " over" : ""}`;

  function pdfPane() {
    return `<div class="panel exam-pdf"><div class="panel-head"><div><p class="eyebrow">THE PASSAGE (INSERT)</p></div><label class="import-btn">${pdfUrl ? "Replace insert PDF" : "Load the Insert PDF"}<input id="exam-pdf-file" type="file" accept="application/pdf"></label></div>${pdfUrl ? `<iframe class="exam-frame" src="${pdfUrl}" title="Text 4 insert"></iframe>` : `<p class="small">Choose the school’s Text 4 Insert PDF from your own device. It stays in this browser only; it is not uploaded to the website.</p>`}</div>`;
  }

  function render(keepScroll) {
    const y = window.scrollY;
    const active = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.q : null;
    root.innerHTML = paperBar() + `<div class="exam-split"><div class="exam-left">${pdfPane()}</div><div class="exam-right">${allQs.map(questionCard).join("")}<div class="panel"><button class="text-btn" data-act="reset">Clear this paper’s answers</button></div></div></div>`;
    root.querySelectorAll("textarea").forEach(ta => ta.addEventListener("input", () => { const w = wcount(ta.value); const el = root.querySelector(ta.dataset.retry ? "#wc-q7r" : "#wc-q7"); if (el) { el.textContent = w; el.classList.toggle("over", w > 80); } }));
    root.querySelectorAll("textarea[data-retry]").forEach(ta => ta.dispatchEvent(new Event("input")));
    const li = root.querySelector("#lang-in");
    if (li) li.addEventListener("change", () => { const v = li.value === "" ? null : Math.max(0, Math.min(5, Number(li.value))); st.aurora.lang = v; save(); render(); });
    if (keepScroll) window.scrollTo(0, y);
  }

  root.addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const act = b.dataset.act, q = allQs.find(x => x.id === b.dataset.q);
    if (act === "submit" || act === "retry") {
      const ta = root.querySelector(`textarea[data-q="${q.id}"]${act === "retry" ? "[data-retry]" : ":not([data-retry])"}`);
      const text = ta.value.trim();
      if (!text) { ta.focus(); return; }
      const r = run(q, text); if (q.id === "q7") r.wc = wcount(text);
      const entry = { text, r, at: new Date().toISOString(), v: RULES };
      const rc = rec(q.id);
      if (act === "submit") { if (!rc.first) rc.first = entry; } else if (!rc.retry) rc.retry = entry;
      save(); render(true);
    } else if (act === "timer") {
      if (timer) { clearInterval(timer); timer = null; } else { timer = setInterval(() => { left--; const el = root.querySelector("#exam-timer"); if (el) el.textContent = fmtTime(left); }, 1000); }
      render(true);
    } else if (act === "reset") {
      if (confirm("Clear all answers and scores for this paper? This cannot be undone.")) { st.aurora = { q: {}, lang: null }; save(); render(); }
    }
  });
  root.addEventListener("change", async e => {
    if (e.target.id !== "exam-pdf-file" || !e.target.files[0]) return;
    const buf = await e.target.files[0].arrayBuffer();
    if (typeof PdfStore !== "undefined") PdfStore.put("aurora-insert", { data: buf, name: e.target.files[0].name });
    setPdf(buf); 
  });
  function setPdf(buf) { if (pdfUrl) URL.revokeObjectURL(pdfUrl); pdfUrl = URL.createObjectURL(new Blob([buf], { type: "application/pdf" })); render(true); }

  P.modelSummary = "The Vikings believed that auroras were the breath of fighters who died fighting or Valkyries reclaiming the spirits of dead soldiers. They also thought it was light shining off the Valkyries’ armour. Cree Indians believe they are ghosts attempting to speak with the living while Algonquins believe they are a fire made by their creator. Swedish fishermen believe it is the reflection of enormous schools of herring nearby that signified luck and a large catch while the Finnish thought it was a fire fox darting.";
  render();
  if (typeof PdfStore !== "undefined") PdfStore.get("aurora-insert").then(r => { if (r && r.data) setPdf(r.data); });
})();
