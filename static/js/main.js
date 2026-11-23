(function () {
  "use strict";

  // Main results (accuracy % and mean turns): [overall, C, R, U, X].
  const MODELS = [{"name":"Claude-Opus-5.5","icon":"claude","type":"closed","acc":[62.78,52.54,66.04,67.02,64.71],"turn":[32.7,32.8,33.5,31.3,36.8]},{"name":"GPT-6.1-sol","icon":"openai","type":"closed","acc":[61.88,47.46,62.26,71.28,58.82],"turn":[19.7,16.6,21.6,20.9,18.5]},{"name":"GPT-6-sol","icon":"openai","type":"closed","acc":[52.91,32.2,52.83,69.15,35.29],"turn":[17.7,10.2,19.6,21.5,18.8]},{"name":"Gemini-3.8-Flash","icon":"gemini","type":"closed","acc":[50.22,33.9,62.26,53.19,52.94],"turn":[37.2,30.9,38.6,40.8,36.5]},{"name":"Claude-Sonnet-5.5","icon":"claude","type":"closed","acc":[49.33,45.76,56.6,48.94,41.18],"turn":[45.5,42.3,46.4,47.4,45.6]},{"name":"Gemini-3.5-Flash","icon":"gemini","type":"closed","acc":[48.43,42.37,52.83,51.06,41.18],"turn":[36.7,29.5,39.2,41.0,28.8]},{"name":"GPT-5.6-sol","icon":"openai","type":"closed","acc":[47.09,20.34,60.38,57.45,41.18],"turn":[13.7,10.0,12.1,17.5,11.5]},{"name":"Qwen3.8-Max","icon":"qwen","type":"closed","acc":[47.09,28.81,58.49,54.26,35.29],"turn":[19.5,12.6,20.1,24.1,17.2]},{"name":"Qwen3.8-Flash","icon":"qwen","type":"closed","acc":[41.7,37.29,54.72,37.23,41.18],"turn":[27.1,16.5,27.6,34.4,23.3]},{"name":"Claude-Haiku-5.5","icon":"claude","type":"closed","acc":[41.26,20.34,56.6,46.81,35.29],"turn":[47.4,48.4,46.2,47.4,47.9]},{"name":"Gemini-3.1-Pro","icon":"gemini","type":"closed","acc":[38.12,23.73,45.28,43.62,35.29],"turn":[26.2,18.4,30.9,28.3,26.9]},{"name":"Qwen3.7-Plus","icon":"qwen","type":"closed","acc":[27.35,6.78,41.51,30.85,35.29],"turn":[20.8,9.3,22.9,27.7,16.7]},{"name":"Kimi-k3","icon":"kimi","type":"open","acc":[51.12,30.51,69.81,53.19,52.94],"turn":[22.5,15.7,25.6,25.9,21.2]},{"name":"DeepSeek-v4.1-Flash-1017","icon":"deepseek","type":"open","acc":[45.74,25.42,50.94,56.38,41.18],"turn":[39.4,39.6,39.0,40.2,35.0]},{"name":"MiniMax-M3.1-Flash","icon":"minimax","type":"open","acc":[38.57,10.17,58.49,46.81,29.41],"turn":[35.3,41.1,29.8,34.2,35.5]},{"name":"GLM-5.3-Flash","icon":"zai","type":"open","acc":[36.77,16.95,54.72,39.36,35.29],"turn":[31.7,26.1,33.7,34.7,31.3]},{"name":"Qwen3.8-27B","icon":"qwen","type":"open","acc":[36.32,13.56,52.83,38.3,52.94],"turn":[18.7,14.3,20.7,20.9,16.7]},{"name":"Qwen3.5-397B-A17B","icon":"qwen","type":"open","acc":[23.77,11.86,37.74,23.4,23.53],"turn":[19.6,12.0,22.0,23.8,21.1]},{"name":"Qwen3.5-27B","icon":"qwen","type":"open","acc":[19.28,8.47,30.19,21.28,11.76],"turn":[23.6,10.4,27.0,31.1,11.1]}];

  /* ---------- Leaderboard ---------- */
  const VIEWS = [
    { title: "All 223 tasks.", desc: "C: Correction, R: Reduction, U: Clue Unification, X: X-View Closure." },
    { name: "Correction", fam: "c", title: "Correction · 59 tasks.", desc: "Locate a plausible factual edit and recover the original content from external records." },
    { name: "Reduction", fam: "r", title: "Reduction · 53 tasks.", desc: "Separate the target from competing candidates through visually verifiable constraints." },
    { name: "Clue Unification", fam: "u", title: "Clue Unification · 94 tasks.", desc: "Link two image clues through an unnamed shared entity or event, then read the answer-bearing detail." },
    { name: "X-View Closure", fam: "x", title: "X-View Closure · 17 tasks.", desc: "Locate the queried detail in a complementary view through spatial correspondence." },
  ];

  const table = document.getElementById("lb");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");
  const panel = document.getElementById("lb-panel");
  const desc = document.getElementById("lb-desc");
  const tabs = Array.from(document.querySelectorAll('[role="tab"][data-view]'));
  const state = { view: 0, filter: "all", key: "acc0", dir: "desc" };

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function columns(view) {
    if (view === 0) {
      return [
        { key: "acc0", label: "Overall", unit: "Acc", main: true, aria: "Overall accuracy" },
        { key: "turn0", label: "Turns", aria: "Mean turns" },
        { key: "acc1", label: "C", unit: "Acc", fam: "c", aria: "Correction accuracy" },
        { key: "acc2", label: "R", unit: "Acc", fam: "r", aria: "Reduction accuracy" },
        { key: "acc3", label: "U", unit: "Acc", fam: "u", aria: "Clue Unification accuracy" },
        { key: "acc4", label: "X", unit: "Acc", fam: "x", aria: "X-View Closure accuracy" },
      ];
    }
    return [
      { key: "acc" + view, label: VIEWS[view].name, short: VIEWS[view].fam.toUpperCase(), unit: "Acc", fam: VIEWS[view].fam, main: true, aria: VIEWS[view].name + " accuracy" },
      { key: "turn" + view, label: "Turns", aria: VIEWS[view].name + " mean turns" },
      { key: "acc0", label: "Overall", unit: "Acc", aria: "Overall accuracy", cls: "c-context" },
    ];
  }

  function value(m, key) {
    if (key === "name") return m.name.toLowerCase();
    const i = Number(key.slice(-1));
    return key.startsWith("acc") ? m.acc[i] : m.turn[i];
  }

  function rankMap(view) {
    const sorted = MODELS.map((m) => m.acc[view]).sort((a, b) => b - a);
    return new Map(MODELS.map((m) => [m, sorted.indexOf(m.acc[view]) + 1]));
  }

  function sortBy(key) {
    if (state.key === key) {
      state.dir = state.dir === "desc" ? "asc" : "desc";
    } else {
      state.key = key;
      state.dir = key === "name" ? "asc" : "desc";
    }
    render();
  }

  function renderHead(cols) {
    const tr = document.createElement("tr");
    const rankTh = el("th", "c-rank", "#");
    rankTh.scope = "col";
    tr.appendChild(rankTh);
    [{ key: "name", label: "Model", cls: "c-model" }].concat(cols).forEach((c) => {
      const th = el("th", c.cls || (c.main ? "c-main" : ""));
      th.scope = "col";
      if (c.key === state.key) th.setAttribute("aria-sort", state.dir === "desc" ? "descending" : "ascending");
      const btn = el("button");
      btn.type = "button";
      if (c.aria) btn.setAttribute("aria-label", c.aria);
      if (c.fam) {
        const dot = el("span", "fam-dot");
        dot.style.setProperty("--fam", "var(--fam-" + c.fam + ")");
        btn.appendChild(dot);
      }
      if (c.short) {
        btn.appendChild(el("span", "lbl-long", c.label));
        btn.appendChild(el("span", "lbl-short", c.short));
      } else {
        btn.appendChild(document.createTextNode(c.label));
      }
      if (c.unit) btn.appendChild(el("span", "unit", c.unit));
      btn.addEventListener("click", () => sortBy(c.key));
      th.appendChild(btn);
      tr.appendChild(th);
    });
    thead.replaceChildren(tr);
  }

  function render() {
    const view = state.view;
    const cols = columns(view);
    const ranks = rankMap(view);
    const rows = MODELS.filter((m) => state.filter === "all" || m.type === state.filter);
    rows.sort((a, b) => {
      const va = value(a, state.key);
      const vb = value(b, state.key);
      let c = va < vb ? -1 : va > vb ? 1 : 0;
      if (state.dir === "desc") c = -c;
      return c || b.acc[view] - a.acc[view] || a.name.localeCompare(b.name);
    });
    const best = {};
    cols.forEach((c) => {
      if (c.key.startsWith("acc")) best[c.key] = Math.max(...rows.map((m) => value(m, c.key)));
    });

    renderHead(cols);
    const frag = document.createDocumentFragment();
    rows.forEach((m) => {
      const tr = document.createElement("tr");
      tr.appendChild(el("td", "c-rank", String(ranks.get(m))));

      const model = el("span", "model");
      const icon = el("img");
      icon.src = "static/icons/" + m.icon + ".svg";
      icon.alt = "";
      icon.width = 18;
      icon.height = 18;
      model.appendChild(icon);
      model.appendChild(el("span", null, m.name));
      if (m.type === "open") model.appendChild(el("span", "tag", "open"));
      const tdModel = el("td", "c-model");
      tdModel.appendChild(model);
      tr.appendChild(tdModel);

      cols.forEach((c) => {
        const v = value(m, c.key);
        const isAcc = c.key.startsWith("acc");
        const cls = [];
        if (c.main) cls.push("c-main");
        if (c.cls) cls.push(c.cls);
        if (isAcc && v === best[c.key]) cls.push("best");
        if (!isAcc) cls.push("dim");
        const td = el("td", cls.join(" "));
        const text = isAcc ? v.toFixed(2) : v.toFixed(1);
        if (c.main) {
          const wrap = el("span", "overall");
          wrap.appendChild(el("span", null, text));
          const bar = el("span", "bar");
          bar.setAttribute("aria-hidden", "true");
          const fill = el("i");
          fill.style.width = v + "%";
          bar.appendChild(fill);
          wrap.appendChild(bar);
          td.appendChild(wrap);
        } else {
          td.textContent = text;
        }
        tr.appendChild(td);
      });
      frag.appendChild(tr);
    });
    tbody.replaceChildren(frag);

    table.dataset.view = String(view);
    const title = el("b", null, VIEWS[view].title);
    desc.replaceChildren(title, document.createTextNode(" " + VIEWS[view].desc));
  }

  function selectTab(tab) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", tab.id);
    state.view = Number(tab.dataset.view);
    state.key = "acc" + state.view;
    state.dir = "desc";
    render();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (e) => {
      const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      const next = tabs[(keys[e.key] + tabs.length) % tabs.length];
      next.focus();
      selectTab(next);
    });
  });

  const filters = document.querySelectorAll("[data-filter]");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.filter = btn.dataset.filter;
      filters.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      render();
    });
  });
  render();

  /* ---------- Figure lightbox ---------- */
  const dialog = document.getElementById("lightbox");
  const dialogImg = dialog.querySelector("img");
  document.querySelectorAll(".zoom").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.dataset.zoom;
      if (typeof dialog.showModal !== "function") {
        window.open(src, "_blank", "noopener");
        return;
      }
      dialogImg.src = src;
      dialogImg.alt = btn.querySelector("img").alt;
      dialog.showModal();
    });
  });
  dialog.addEventListener("click", () => dialog.close());

  /* ---------- Copy BibTeX ---------- */
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = document.getElementById(btn.dataset.copy).textContent;
      const label = btn.textContent;
      const done = () => {
        btn.textContent = "Copied";
        setTimeout(() => { btn.textContent = label; }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done);
      } else {
        const range = document.createRange();
        range.selectNodeContents(document.getElementById(btn.dataset.copy));
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
  });

  /* ---------- Current section in the header ---------- */
  const links = Array.from(document.querySelectorAll(".nav-links a"));
  const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => s && observer.observe(s));
  }
})();
