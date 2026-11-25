/* Two-way video comparison slider (canvas), in the style of the Nerfies / GOFish project pages: one video holds both renders side by side
   (left half = baseline, right half = ours); the canvas shows the left half left of the divider and the right half right of it. Pointer or
   arrow keys move the divider; Space pauses. Labels come from data-left-label / data-right-label on the container. */
(function () {
  "use strict";
  function setup(container) {
    const video = container.querySelector("video");
    const canvas = container.querySelector("canvas.videoMerge");
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    const leftLabel = container.dataset.leftLabel || "", rightLabel = container.dataset.rightLabel || "";
    let pos = 0.5, raf = null, hover = false;
    // Until the video has a frame, the poster (the same side-by-side frame) stands in,
    // so a lazily loaded comparison never shows an empty canvas.
    const poster = new Image();
    if (video.poster) poster.src = video.poster;
    function source() {
      if (video.readyState >= 2) return {el: video, w: video.videoWidth, h: video.videoHeight};
      if (poster.complete && poster.naturalWidth) return {el: poster, w: poster.naturalWidth, h: poster.naturalHeight};
      return {el: null, w: 0, h: 0};
    }
    function size() {
      const src = source(), w = container.clientWidth, vw = src.w / 2, vh = src.h;
      if (!w || !vw || !vh) return;
      const h = Math.round(w * vh / vw);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    }
    function label(text, x, align) {
      if (!text) return;
      const fs = Math.max(13, Math.round(canvas.width / 56));
      ctx.font = "600 " + fs + "px 'Google Sans', 'Noto Sans', sans-serif"; ctx.textBaseline = "top"; ctx.textAlign = "left";
      const pad = 8, tw = ctx.measureText(text).width, bw = tw + 2 * pad, bh = fs + 2 * pad - 4;
      const bx = align === "left" ? x : x - bw;
      ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(bx, 12, bw, bh);
      ctx.fillStyle = "#fff"; ctx.fillText(text, bx + pad, 12 + pad - 3);
    }
    function draw() {
      size();
      const src = source(), w = canvas.width, h = canvas.height, vw = src.w / 2, vh = src.h;
      if (w && vw && vh && src.el) {
        const split = Math.round(pos * w);
        ctx.drawImage(src.el, 0, 0, vw * pos, vh, 0, 0, split, h);                          // left half of the video, left of the divider
        ctx.drawImage(src.el, vw + vw * pos, 0, vw * (1 - pos), vh, split, 0, w - split, h);   // right half of the video, right of the divider
        ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fillRect(split - 1, 0, 2, h);
        ctx.beginPath(); ctx.arc(split, h / 2, 16, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.fill();
        ctx.fillStyle = "#333"; ctx.font = "bold 15px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("↔", split, h / 2 + 1);
        label(leftLabel, 12, "left"); label(rightLabel, w - 12, "right");
      }
      raf = requestAnimationFrame(draw);
    }
    function setPos(clientX) {
      const r = canvas.getBoundingClientRect(); pos = Math.min(0.98, Math.max(0.02, (clientX - r.left) / r.width));
      canvas.setAttribute("aria-valuenow", Math.round(pos * 100));
    }
    canvas.addEventListener("pointermove", function (e) { if (hover || e.pointerType === "touch" || e.buttons) setPos(e.clientX); });
    canvas.addEventListener("pointerenter", function () { hover = true; });
    canvas.addEventListener("pointerleave", function () { hover = false; });
    canvas.addEventListener("pointerdown", function (e) { setPos(e.clientX); });
    canvas.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { pos = Math.max(0.02, pos - 0.02); e.preventDefault(); }
      else if (e.key === "ArrowRight") { pos = Math.min(0.98, pos + 0.02); e.preventDefault(); }
      else if (e.key === " ") { if (video.paused) video.play(); else video.pause(); e.preventDefault(); }
    });
    canvas.addEventListener("click", function () { if (video.paused) video.play(); });
    video.addEventListener("loadedmetadata", size); window.addEventListener("resize", size);
    // Play only while on screen: a clip that becomes playable off screen waits for the observer.
    let visible = false;
    const start = function () { if (!raf) draw(); if (visible) video.play().catch(function () {}); };
    if (video.readyState >= 2) start(); else video.addEventListener("canplay", start, { once: true });
    poster.addEventListener("load", function () { if (!raf) draw(); }, { once: true });
    const io = new IntersectionObserver(function (entries) { entries.forEach(function (en) { visible = en.isIntersecting; if (visible) video.play().catch(function () {}); else video.pause(); }); }, { threshold: 0.1 });
    io.observe(container);
  }
  document.addEventListener("DOMContentLoaded", function () { document.querySelectorAll(".video-compare-container").forEach(setup); });
})();
