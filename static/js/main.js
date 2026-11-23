(function () {
  "use strict";

  // Main results (accuracy % and mean turns): [overall, C, R, U, X].
  const MODELS = [{"name":"Claude-Opus-5.5","icon":"claude","type":"closed","acc":[62.78,52.54,66.04,67.02,64.71],"turn":[32.7,32.8,33.5,31.3,36.8]},{"name":"GPT-6.1-sol","icon":"openai","type":"closed","acc":[61.88,47.46,62.26,71.28,58.82],"turn":[19.7,16.6,21.6,20.9,18.5]},{"name":"GPT-6-sol","icon":"openai","type":"closed","acc":[52.91,32.2,52.83,69.15,35.29],"turn":[17.7,10.2,19.6,21.5,18.8]},{"name":"Gemini-3.8-Flash","icon":"gemini","type":"closed","acc":[50.22,33.9,62.26,53.19,52.94],"turn":[37.2,30.9,38.6,40.8,36.5]},{"name":"Claude-Sonnet-5.5","icon":"claude","type":"closed","acc":[49.33,45.76,56.6,48.94,41.18],"turn":[45.5,42.3,46.4,47.4,45.6]},{"name":"Gemini-3.5-Flash","icon":"gemini","type":"closed","acc":[48.43,42.37,52.83,51.06,41.18],"turn":[36.7,29.5,39.2,41.0,28.8]},{"name":"GPT-5.6-sol","icon":"openai","type":"closed","acc":[47.09,20.34,60.38,57.45,41.18],"turn":[13.7,10.0,12.1,17.5,11.5]},{"name":"Qwen3.8-Max","icon":"qwen","type":"closed","acc":[47.09,28.81,58.49,54.26,35.29],"turn":[19.5,12.6,20.1,24.1,17.2]},{"name":"Qwen3.8-Flash","icon":"qwen","type":"closed","acc":[41.7,37.29,54.72,37.23,41.18],"turn":[27.1,16.5,27.6,34.4,23.3]},{"name":"Claude-Haiku-5.5","icon":"claude","type":"closed","acc":[41.26,20.34,56.6,46.81,35.29],"turn":[47.4,48.4,46.2,47.4,47.9]},{"name":"Gemini-3.1-Pro","icon":"gemini","type":"closed","acc":[38.12,23.73,45.28,43.62,35.29],"turn":[26.2,18.4,30.9,28.3,26.9]},{"name":"Qwen3.7-Plus","icon":"qwen","type":"closed","acc":[27.35,6.78,41.51,30.85,35.29],"turn":[20.8,9.3,22.9,27.7,16.7]},{"name":"Kimi-k3","icon":"kimi","type":"open","acc":[51.12,30.51,69.81,53.19,52.94],"turn":[22.5,15.7,25.6,25.9,21.2]},{"name":"DeepSeek-v4.1-Flash-1017","icon":"deepseek","type":"open","acc":[45.74,25.42,50.94,56.38,41.18],"turn":[39.4,39.6,39.0,40.2,35.0]},{"name":"MiniMax-M3.1-Flash","icon":"minimax","type":"open","acc":[38.57,10.17,58.49,46.81,29.41],"turn":[35.3,41.1,29.8,34.2,35.5]},{"name":"GLM-5.3-Flash","icon":"zai","type":"open","acc":[36.77,16.95,54.72,39.36,35.29],"turn":[31.7,26.1,33.7,34.7,31.3]},{"name":"Qwen3.8-27B","icon":"qwen","type":"open","acc":[36.32,13.56,52.83,38.3,52.94],"turn":[18.7,14.3,20.7,20.9,16.7]},{"name":"Qwen3.5-397B-A17B","icon":"qwen","type":"open","acc":[23.77,11.86,37.74,23.4,23.53],"turn":[19.6,12.0,22.0,23.8,21.1]},{"name":"Qwen3.5-27B","icon":"qwen","type":"open","acc":[19.28,8.47,30.19,21.28,11.76],"turn":[23.6,10.4,27.0,31.1,11.1]}];

  /* ---------- Leaderboard ---------- */
  const table = document.getElementById("lb");
  const tbody = table.querySelector("tbody");
  const headers = Array.from(table.querySelectorAll("thead th[data-key]"));
  const state = { filter: "all", metric: "acc", key: "acc0", dir: "desc" };

  const overallSorted = MODELS.map((m) => m.acc[0]).sort((a, b) => b - a);
  MODELS.forEach((m) => { m.rank = overallSorted.indexOf(m.acc[0]) + 1; });

  function value(m, key) {
    if (key === "name") return m.name.toLowerCase();
    if (key === "acc0") return m.acc[0];
    if (key === "turn0") return m.turn[0];
    return m[state.metric][Number(key.slice(1))];
  }

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function render() {
    const rows = MODELS.filter((m) => state.filter === "all" || m.type === state.filter);
    rows.sort((a, b) => {
      const va = value(a, state.key);
      const vb = value(b, state.key);
      let c = va < vb ? -1 : va > vb ? 1 : 0;
      if (state.dir === "desc") c = -c;
      return c || b.acc[0] - a.acc[0] || a.name.localeCompare(b.name);
    });
    const best = [0, 1, 2, 3, 4].map((i) => Math.max(...rows.map((m) => m.acc[i])));

    const frag = document.createDocumentFragment();
    rows.forEach((m) => {
      const tr = document.createElement("tr");
      tr.appendChild(el("td", "c-rank", String(m.rank)));

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

      const tdOverall = el("td", "c-overall" + (m.acc[0] === best[0] ? " best" : ""));
      const overall = el("span", "overall");
      overall.appendChild(el("span", null, m.acc[0].toFixed(2)));
      const bar = el("span", "bar");
      bar.setAttribute("aria-hidden", "true");
      const fill = el("i");
      fill.style.width = m.acc[0] + "%";
      bar.appendChild(fill);
      overall.appendChild(bar);
      tdOverall.appendChild(overall);
      tr.appendChild(tdOverall);

      tr.appendChild(el("td", "dim", m.turn[0].toFixed(1)));

      for (let i = 1; i <= 4; i++) {
        if (state.metric === "acc") {
          tr.appendChild(el("td", m.acc[i] === best[i] ? "best" : "", m.acc[i].toFixed(2)));
        } else {
          tr.appendChild(el("td", "dim", m.turn[i].toFixed(1)));
        }
      }
      frag.appendChild(tr);
    });
    tbody.replaceChildren(frag);

    headers.forEach((th) => {
      if (th.dataset.key === state.key) {
        th.setAttribute("aria-sort", state.dir === "desc" ? "descending" : "ascending");
      } else {
        th.removeAttribute("aria-sort");
      }
    });
    table.querySelectorAll("[data-unit]").forEach((u) => {
      u.textContent = state.metric === "acc" ? "Acc" : "Turns";
    });
  }

  headers.forEach((th) => {
    th.querySelector("button").addEventListener("click", () => {
      const key = th.dataset.key;
      if (state.key === key) {
        state.dir = state.dir === "desc" ? "asc" : "desc";
      } else {
        state.key = key;
        state.dir = key === "name" ? "asc" : "desc";
      }
      render();
    });
  });

  function bindSegment(attr, field) {
    const buttons = document.querySelectorAll("[data-" + attr + "]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        state[field] = btn.dataset[attr];
        buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        render();
      });
    });
  }
  bindSegment("filter", "filter");
  bindSegment("metric", "metric");
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
