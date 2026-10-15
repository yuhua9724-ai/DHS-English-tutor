/* DHS English Studio — local PDF viewer with section highlighting.
   Uses pdf.js (vendor/). The PDF is opened from the student's own device and kept only in this
   browser (IndexedDB). Nothing is uploaded and no story text is stored in the site's code. */

const PdfStore = (() => {
  function open() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) return reject(new Error("IndexedDB unavailable"));
      const req = indexedDB.open("dhsEnglishStudio", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("pdfs");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function run(mode, fn) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("pdfs", mode);
      const req = fn(tx.objectStore("pdfs"));
      tx.oncomplete = () => resolve(req && req.result);
      tx.onerror = () => reject(tx.error);
    });
  }
  return {
    get: key => run("readonly", s => s.get(key)).catch(() => null),
    put: (key, value) => run("readwrite", s => s.put(value, key)).catch(() => null),
    del: key => run("readwrite", s => s.delete(key)).catch(() => null)
  };
})();

const PdfView = (() => {
  let doc = null, root = null, zoom = 1, token = 0, index = null, docKey = null, lastWidth = 0, resizeTimer = null;
  const pages = [];
  const listeners = [];

  const available = () => typeof pdfjsLib !== "undefined";

  function normChar(ch) {
    const c = ch.toLowerCase();
    return /[a-z0-9À-ɏ]/.test(c) ? c : " ";
  }
  function normPhrase(p) {
    let out = "";
    for (const ch of String(p || "")) {
      const c = normChar(ch);
      if (c === " " && (out === "" || out.endsWith(" "))) continue;
      out += c;
    }
    return out.trim();
  }

  function init(el) {
    root = el;
    if (available()) pdfjsLib.GlobalWorkerOptions.workerSrc = "vendor/pdf.worker.min.js";
    if (window.ResizeObserver) {
      new ResizeObserver(() => {
        if (!doc || !root.clientWidth) return;
        if (Math.abs(root.clientWidth - lastWidth) < 12) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => render(), 250);
      }).observe(root);
    }
  }

  async function load(buffer, key) {
    if (!available()) throw new Error("pdf.js is not available");
    clear();
    doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise;
    docKey = key;
    await render();
  }

  function clear() {
    token++;
    doc = null; docKey = null; index = null; pages.length = 0;
    if (root) root.innerHTML = "";
  }

  async function render() {
    if (!doc) return;
    const my = ++token;
    const keep = root.scrollHeight > 0 ? root.scrollTop / root.scrollHeight : 0;
    root.innerHTML = "";
    pages.length = 0; index = null;
    lastWidth = root.clientWidth;
    const avail = Math.max(320, root.clientWidth - 28);
    const total = Math.min(doc.numPages, 60);
    const dpr = window.devicePixelRatio || 1;
    for (let i = 1; i <= total; i++) {
      const page = await doc.getPage(i);
      if (my !== token) return;
      const base = page.getViewport({ scale: 1 });
      const scale = (avail / base.width) * zoom;
      const vp = page.getViewport({ scale });
      const wrap = document.createElement("div");
      wrap.className = "pdf-page";
      wrap.dataset.page = String(i);
      wrap.style.width = vp.width + "px";
      wrap.style.height = vp.height + "px";
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(vp.width * dpr);
      canvas.height = Math.floor(vp.height * dpr);
      canvas.style.width = vp.width + "px";
      canvas.style.height = vp.height + "px";
      const hl = document.createElement("div"); hl.className = "hl-layer";
      const tl = document.createElement("div"); tl.className = "textLayer";
      tl.style.setProperty("--scale-factor", String(scale));
      const tag = document.createElement("span"); tag.className = "page-tag"; tag.textContent = `Page ${i}`;
      wrap.append(canvas, hl, tl, tag);
      root.append(wrap);
      await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null }).promise;
      if (my !== token) return;
      const content = await page.getTextContent();
      const textDivs = [];
      await pdfjsLib.renderTextLayer({ textContentSource: content, container: tl, viewport: vp, textDivs }).promise;
      pages.push({ el: wrap, textDivs });
    }
    if (my !== token) return;
    buildIndex();
    root.scrollTop = keep * root.scrollHeight;
    listeners.forEach(fn => { try { fn(); } catch { /* ignore */ } });
  }

  function buildIndex() {
    let norm = "";
    const map = [];
    pages.forEach((pg, pi) => pg.textDivs.forEach((sp, si) => {
      const t = sp.textContent || "";
      for (let k = 0; k < t.length; k++) {
        const c = normChar(t[k]);
        if (c === " " && (norm === "" || norm.endsWith(" "))) continue;
        norm += c;
        map.push([pi, si, k]);
      }
      if (norm !== "" && !norm.endsWith(" ")) { norm += " "; map.push([pi, si, Math.max(0, t.length - 1)]); }
    }));
    index = { norm, map };
  }

  function clearHighlights() {
    root.querySelectorAll(".hl-layer").forEach(l => { l.innerHTML = ""; });
  }

  function addBox(pageEl, rect, cls) {
    const pr = pageEl.getBoundingClientRect();
    const d = document.createElement("div");
    d.className = cls;
    d.style.left = (rect.left - pr.left) + "px";
    d.style.top = (rect.top - pr.top) + "px";
    d.style.width = rect.width + "px";
    d.style.height = rect.height + "px";
    pageEl.querySelector(".hl-layer").appendChild(d);
    return d;
  }

  function addBadge(pageEl, rect, text, cls, id) {
    const pr = pageEl.getBoundingClientRect();
    const b = document.createElement("div");
    b.className = "hl-badge " + cls;
    b.dataset.id = id;
    b.textContent = text;
    b.style.top = (rect.top - pr.top - 2) + "px";
    pageEl.querySelector(".hl-layer").appendChild(b);
    return b;
  }

  /* items: [{id, label, start, end, current}] → {id: "ok" | "no-index" | "start-missing" | "end-missing" | "no-range"} */
  function highlight(items) {
    const status = {};
    if (!doc || !index) { items.forEach(i => { status[i.id] = "no-index"; }); return status; }
    clearHighlights();
    items.forEach(item => {
      if (!item.start) { status[item.id] = "no-range"; return; }
      const sNorm = normPhrase(item.start);
      const s = sNorm ? index.norm.indexOf(sNorm) : -1;
      if (s < 0) { status[item.id] = "start-missing"; return; }
      const eNorm = normPhrase(item.end);
      const e = eNorm ? index.norm.indexOf(eNorm, s + 1) : -1;
      if (e < 0) {
        status[item.id] = "end-missing";
        const g = groupsFor(s, s + Math.max(0, sNorm.length - 1));
        if (g.length) {
          const r = rectOf(g[0]);
          if (r) addBadge(pages[g[0].pi].el, r, `▶ ${item.label}`, item.current ? "start current" : "start", item.id);
        }
        return;
      }
      const last = e + eNorm.length - 1;
      const groups = groupsFor(s, last);
      groups.forEach((g, gi) => {
        const rects = rectsOf(g);
        rects.forEach(r => addBox(pages[g.pi].el, r, item.current ? "hl-box current" : "hl-box other"));
        if (gi === 0 && rects[0]) addBadge(pages[g.pi].el, rects[0], `▶ ${item.label}`, item.current ? "start current" : "start", item.id);
        if (gi === groups.length - 1 && rects.length) addBadge(pages[g.pi].el, rects[rects.length - 1], `■ ${item.label}`, item.current ? "end current" : "end", item.id);
      });
      status[item.id] = "ok";
    });
    return status;
  }

  function groupsFor(from, to) {
    const groups = [];
    let cur = null;
    for (let i = from; i <= to && i < index.map.length; i++) {
      const [pi, si, off] = index.map[i];
      if (cur && cur.pi === pi && cur.si === si) { cur.a = Math.min(cur.a, off); cur.b = Math.max(cur.b, off); }
      else { cur = { pi, si, a: off, b: off }; groups.push(cur); }
    }
    return groups;
  }

  function rectsOf(g) {
    const el = pages[g.pi].textDivs[g.si];
    const node = el && el.firstChild;
    if (!node || node.nodeType !== 3) return [];
    const r = document.createRange();
    r.setStart(node, Math.min(g.a, node.length));
    r.setEnd(node, Math.min(g.b + 1, node.length));
    return [...r.getClientRects()].filter(x => x.width > 0 && x.height > 0);
  }
  function rectOf(g) { return rectsOf(g)[0]; }

  /* Returns the first run of n consecutive words of `text` that also appears in the loaded PDF ("" if none). */
  function longestRun(text, n) {
    if (!index) return "";
    const ws = normPhrase(text).split(" ").filter(Boolean);
    for (let i = 0; i + n <= ws.length; i++) {
      const run = ws.slice(i, i + n).join(" ");
      if (index.norm.includes(run)) return ws.slice(i, i + Math.min(n, 6)).join(" ");
    }
    return "";
  }

  /* True if the normalised text appears inside the loaded PDF. */
  function contains(text) {
    if (!index) return true;
    const n = normPhrase(text).replace(/ /g, "");
    if (!n) return true;
    if (!index.compact) index.compact = index.norm.replace(/ /g, "");
    return index.compact.includes(n);
  }

  function scrollTo(id) {
    const b = root.querySelector(`.hl-badge.start[data-id="${id}"]`);
    if (!b) return false;
    const top = root.scrollTop + (b.getBoundingClientRect().top - root.getBoundingClientRect().top) - 90;
    root.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    return true;
  }

  function selectionInfo() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return null;
    const text = sel.toString().replace(/\s+/g, " ").trim();
    if (!text) return null;
    const pg = n => {
      const e = n && (n.nodeType === 3 ? n.parentElement : n);
      const p = e && e.closest && e.closest(".pdf-page");
      return p ? Number(p.dataset.page) : null;
    };
    const a = pg(sel.anchorNode), f = pg(sel.focusNode);
    if (!a && !f) return null;
    const x = a || f, y = f || a;
    return { text, p1: Math.min(x, y), p2: Math.max(x, y) };
  }

  return {
    init, load, clear, available,
    hasDoc: () => !!doc,
    key: () => docKey,
    ready: () => !!index,
    highlight, scrollTo, selectionInfo, longestRun, contains,
    onRendered: fn => listeners.push(fn),
    setZoom: z => { zoom = Math.max(0.6, Math.min(2.2, z)); return render(); },
    getZoom: () => zoom
  };
})();
