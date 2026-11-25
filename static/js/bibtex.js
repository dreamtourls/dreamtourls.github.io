(() => {
  const button = document.getElementById("copy-btn");
  const content = document.getElementById("bibtex-content");
  if (!button || !content) return;
  let reset;
  function copied() {
    button.classList.add("copied");
    button.innerHTML = '<svg class="fa-svg" viewBox="0 0 448 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>';
    button.setAttribute("aria-label", "BibTeX copied");
    clearTimeout(reset);
    reset = setTimeout(() => {
      button.classList.remove("copied");
      button.innerHTML = '<svg class="fa-svg" viewBox="0 0 448 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16l140.1 0L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>';
      button.setAttribute("aria-label", "Copy BibTeX to clipboard");
    }, 2000);
  }
  function fallback(text) {
    const field = document.createElement("textarea");
    const focused = document.activeElement;
    field.value = text;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.focus();
    field.select();
    try {
      if (document.execCommand("copy")) copied();
    } finally {
      field.remove();
      if (focused && focused.isConnected) focused.focus({preventScroll: true});
    }
  }
  button.addEventListener("click", async event => {
    event.preventDefault();
    const text = content.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copied();
        return;
      } catch (_) {}
    }
    fallback(text);
  });
})();
