/* =============================================
   scroll.js — Scroll interactions for homepage
   ============================================= */

(function () {

  const dot        = document.getElementById('logoDot');
  const scrollHint = document.getElementById('scrollHint');
  const items      = document.querySelectorAll('.project-item');

  // Guard — if elements aren't found, exit silently
  if (!dot) return;

  // ── 1. BOUNCING LOGO DOT
  //
  // On first scroll: the dot detaches from the header,
  // goes fixed, and starts bouncing around the LEFT side
  // of the page — a strip roughly 80px wide.
  // Every JUMP_EVERY scroll events it picks a new random
  // target and smoothly transitions there.

  let isDetached = false;

  function getMarginBounds() {
    // Find the left margin strip — gap between viewport edge and page content
    const pageWrap  = document.querySelector('.page-wrap');
    const wrapRect  = pageWrap ? pageWrap.getBoundingClientRect() : null;
    const contentLeft = wrapRect ? wrapRect.left + 48 : 96;
    return {
      minX: 8,
      maxX: Math.max(contentLeft - 52 - 8, 12), // 52 = dot width, 8 = gap from content
      minY: 20,
      maxY: window.innerHeight - 72
    };
  }

  function detachDot() {
    if (isDetached) return;
    isDetached = true;

    // Ghost keeps header height intact once dot is pulled out
    const ghost = document.createElement('span');
    ghost.className = 'logo-dot-ghost';
    dot.parentNode.insertBefore(ghost, dot.nextSibling);

    // Lock to current screen position before switching to fixed
    const rect = dot.getBoundingClientRect();
    dot.classList.add('bouncing');
    dot.style.left = rect.left + 'px';
    dot.style.top  = rect.top  + 'px';
  }

  function reattachDot() {
    if (!isDetached) return;
    isDetached = false;

    // Remove the ghost
    const ghost = dot.parentNode.querySelector('.logo-dot-ghost');
    if (ghost) ghost.remove();

    // Snap back to static position in the header
    dot.classList.remove('bouncing');
    dot.style.left = '';
    dot.style.top  = '';
  }

  function updateDotPosition(scrollY) {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    // progress: 0 at top, 1 at bottom
    const progress = Math.min(scrollY / docHeight, 1);

    const b = getMarginBounds();
    const stripWidth  = b.maxX - b.minX;
    const stripHeight = b.maxY - b.minY;

    // Zigzag X — uses a triangle wave so it goes left→right→left smoothly
    // ZIGZAGS controls how many full left-right sweeps happen top to bottom
    const ZIGZAGS = 3;
    const wave = progress * ZIGZAGS * 2;           // 0 → ZIGZAGS*2
    const tri  = Math.abs((wave % 2) - 1);          // triangle wave 0→1→0
    const newX = Math.round(b.minX + tri * stripWidth);

    // Y moves straight downward with scroll
    const newY = Math.round(b.minY + progress * stripHeight);

    dot.style.left = newX + 'px';
    dot.style.top  = newY + 'px';
  }

  function onScroll() {
    const scrollY = window.scrollY;

    // Hide scroll hint once user has scrolled down
    if (scrollHint) {
      scrollHint.classList.toggle('hidden', scrollY > 60);
    }

    if (scrollY <= 0) {
      // Back at the very top — return dot to header
      reattachDot();
    } else {
      // Scrolled down — detach and move dot
      if (!isDetached) detachDot();
      updateDotPosition(scrollY);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });


  // ── 2. PROJECT CARDS FADE IN ON SCROLL
  //
  // Each card starts invisible (opacity: 0, translateY: 24px in CSS).
  // IntersectionObserver adds .visible when 15% of the card enters
  // the viewport. A staggered transitionDelay creates a cascade effect.

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        const rect = entry.target.getBoundingClientRect();
        const viewportMid = window.innerHeight / 2;

        if (entry.isIntersecting) {
          // Entering viewport — fade in upward
          entry.target.classList.add('visible');
          entry.target.classList.remove('exit');
        } else {
          // Only fade out if card is leaving from the bottom of the screen
          // (rect.top > viewportMid means we're scrolling up past it)
          if (rect.top > viewportMid) {
            entry.target.classList.remove('visible');
            entry.target.classList.add('exit');
          }
          // If leaving from the top (scrolling down past it), leave visible
        }
      });
    },
    { threshold: [0, 0.1, 0.15] }
  );

  items.forEach(function (item, index) {
    item.style.transitionDelay = (index * 0.08) + 's';
    observer.observe(item);
  });

})();