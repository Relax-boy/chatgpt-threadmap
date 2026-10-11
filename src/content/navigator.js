(function mountThreadMap() {
  "use strict";

  if (globalThis.__CHATGPT_THREADMAP_ACTIVE__) return;
  globalThis.__CHATGPT_THREADMAP_ACTIVE__ = true;

  const state = {
    entries: [],
    activeIndex: -1,
    open: false,
    query: "",
    scrollElement: null,
    scrollFrame: 0,
    refreshFrame: 0,
    navigationToken: 0
  };

  const ui = buildUi();

  function buildUi() {
    const root = document.createElement("section");
    root.className = "tc-root";
    root.dataset.threadmap = "true";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "tc-trigger";
    trigger.setAttribute("aria-label", "打开会话时间线");
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML = '<span class="tc-trigger__mark" aria-hidden="true"><i></i><i></i><i></i></span><span class="tc-trigger__count">0</span>';

    const panel = document.createElement("div");
    panel.className = "tc-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "会话时间线");

    const header = document.createElement("header");
    header.className = "tc-header";
    header.innerHTML = '<div><span class="tc-eyebrow">CHATGPT THREADMAP</span><h2>会话地图</h2></div>';

    const close = document.createElement("button");
    close.type = "button";
    close.className = "tc-close";
    close.setAttribute("aria-label", "关闭会话时间线");
    close.textContent = "×";
    header.appendChild(close);

    const searchWrap = document.createElement("label");
    searchWrap.className = "tc-search";
    searchWrap.innerHTML = '<span aria-hidden="true">⌕</span>';
    const search = document.createElement("input");
    search.type = "search";
    search.placeholder = "筛选提问…";
    search.setAttribute("aria-label", "筛选提问");
    searchWrap.appendChild(search);

    const status = document.createElement("div");
    status.className = "tc-status";
    const list = document.createElement("ol");
    list.className = "tc-list";

    panel.append(header, searchWrap, status, list);
    root.append(trigger, panel);
    document.body.appendChild(root);

    trigger.addEventListener("click", () => setOpen(!state.open));
    close.addEventListener("click", () => setOpen(false));
    search.addEventListener("input", () => {
      state.query = search.value.trim().toLocaleLowerCase();
      render();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
      if (event.altKey && event.key.toLocaleLowerCase() === "j") {
        event.preventDefault();
        setOpen(!state.open);
      }
    });

    return { root, trigger, panel, search, status, list };
  }

  function setOpen(open) {
    state.open = Boolean(open);
    ui.root.dataset.open = String(state.open);
    ui.trigger.setAttribute("aria-expanded", String(state.open));
    if (state.open) {
      render();
      window.setTimeout(() => ui.search.focus(), 120);
    }
  }

  function labelRole(text) {
    const value = (text || "").replace(/\s+/g, " ").trim();
    return /^(?:you said|user said|你说|您说|用户说)\s*[:：]?$/i.test(value);
  }

  function visibleMessageFor(label) {
    const wrapper = label.parentElement;
    if (!(wrapper instanceof HTMLElement)) return null;
    return wrapper.querySelector(
      "[class*='group/user-message'], [class*='bg-user-message'], .text-size-chat.whitespace-pre-wrap, .whitespace-pre-wrap, [data-testid*='user-message']"
    ) || wrapper;
  }

  function titleFor(element) {
    const content = element.querySelector(
      ".text-size-chat.whitespace-pre-wrap, .whitespace-pre-wrap, [class*='bg-user-message'], [data-testid*='user-message'], .rich-text"
    ) || element;
    return (content.innerText || content.textContent || "")
      .split("\n").map((line) => line.trim()).find(Boolean)
      ?.replace(/\s+/g, " ").slice(0, 140) || "未命名提问";
  }

  function findScrollElement(element) {
    let current = element?.parentElement || null;
    while (current && current !== document.body) {
      const style = getComputedStyle(current);
      if (/(auto|scroll|overlay)/.test(style.overflowY) && current.scrollHeight > current.clientHeight + 8) return current;
      current = current.parentElement;
    }
    return document.scrollingElement;
  }

  function collectEntries() {
    const labels = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).filter((heading) =>
      !heading.closest("[data-threadmap]") && labelRole(heading.textContent));
    const seen = new Set();
    return labels.map(visibleMessageFor).filter((element) => {
      if (!(element instanceof HTMLElement) || seen.has(element)) return false;
      seen.add(element);
      return true;
    }).map((element, index) => ({ element, index, title: titleFor(element) }));
  }

  function refresh() {
    state.entries = collectEntries();
    bindScroll();
    updateActive();
    render();
  }

  function bindScroll() {
    const next = state.entries.length ? findScrollElement(state.entries[0].element) : null;
    if (next === state.scrollElement) return;
    state.scrollElement?.removeEventListener("scroll", scheduleActiveUpdate);
    state.scrollElement = next;
    state.scrollElement?.addEventListener("scroll", scheduleActiveUpdate, { passive: true });
  }

  function scheduleActiveUpdate() {
    if (state.scrollFrame) return;
    state.scrollFrame = requestAnimationFrame(() => {
      state.scrollFrame = 0;
      updateActive();
      paintActive();
    });
  }

  function updateActive() {
    if (!state.entries.length) {
      state.activeIndex = -1;
      return;
    }
    const scrollerRect = state.scrollElement instanceof HTMLElement
      ? state.scrollElement.getBoundingClientRect()
      : { top: 0, bottom: innerHeight };
    const line = scrollerRect.top + Math.min(180, Math.max(88, (scrollerRect.bottom - scrollerRect.top) * 0.2));
    let active = 0;
    state.entries.forEach((entry, index) => {
      const rect = entry.element.getBoundingClientRect();
      if (rect.height > 0 && rect.top <= line) active = index;
    });
    state.activeIndex = active;
  }

  function navigate(entry) {
    if (!(entry?.element instanceof HTMLElement)) return;
    state.navigationToken += 1;
    const token = state.navigationToken;
    const target = entry.element;
    const scroller = findScrollElement(target);
    const started = Date.now();
    state.activeIndex = entry.index;
    paintActive();

    target.scrollIntoView({ block: "start", inline: "nearest", behavior: "smooth" });
    function settle() {
      if (token !== state.navigationToken || !target.isConnected) return;
      const containerTop = scroller instanceof HTMLElement ? scroller.getBoundingClientRect().top : 0;
      const delta = target.getBoundingClientRect().top - containerTop - 84;
      if (Math.abs(delta) > 2) {
        if (scroller instanceof HTMLElement && scroller !== document.body && scroller !== document.documentElement) {
          scroller.scrollBy({ top: delta, behavior: "auto" });
        } else {
          window.scrollBy({ top: delta, behavior: "auto" });
        }
      }
      if (Date.now() - started < 900) requestAnimationFrame(settle);
    }
    requestAnimationFrame(settle);
    setOpen(false);
  }

  function render() {
    ui.trigger.querySelector(".tc-trigger__count").textContent = String(state.entries.length);
    const filtered = state.entries.filter((entry) => !state.query || entry.title.toLocaleLowerCase().includes(state.query));
    ui.status.textContent = state.entries.length
      ? `${filtered.length} / ${state.entries.length} 条提问 · Alt J`
      : "正在等待会话内容…";
    ui.list.replaceChildren();
    const fragment = document.createDocumentFragment();
    filtered.forEach((entry) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tc-entry";
      button.dataset.index = String(entry.index);
      button.innerHTML = `<span class="tc-entry__number">${String(entry.index + 1).padStart(2, "0")}</span><span class="tc-entry__title"></span>`;
      button.querySelector(".tc-entry__title").textContent = entry.title;
      button.addEventListener("click", () => navigate(entry));
      item.appendChild(button);
      fragment.appendChild(item);
    });
    ui.list.appendChild(fragment);
    paintActive();
  }

  function paintActive() {
    ui.list.querySelectorAll(".tc-entry").forEach((button) => {
      const active = Number(button.dataset.index) === state.activeIndex;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-current", active ? "location" : "false");
    });
  }

  const observer = new MutationObserver((mutations) => {
    const onlyCompassChanged = mutations.every((mutation) => {
      const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement;
      return target?.closest?.("[data-threadmap]");
    });
    if (onlyCompassChanged) return;
    cancelAnimationFrame(state.refreshFrame);
    state.refreshFrame = requestAnimationFrame(refresh);
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("resize", scheduleActiveUpdate, { passive: true });
  window.addEventListener("wheel", (event) => {
    if (!event.target.closest?.("[data-threadmap]")) state.navigationToken += 1;
  }, { passive: true });
  window.addEventListener("popstate", () => window.setTimeout(refresh, 120));
  refresh();
  window.setTimeout(refresh, 700);
  window.setTimeout(refresh, 1800);
})();
