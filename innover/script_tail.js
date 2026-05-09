(function() {
'use strict';
// ═══════════════════════════════════════════════════════════════
// 1. MASTER ENGINE: LENIS + GSAP SYNC
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// 1. MASTER ENGINE: LENIS + GSAP SYNC
// ═══════════════════════════════════════════════════════════════
if (window.innoverEngineInitialized) {
    console.warn("⚠️ Innover Engine: Already running. Skipping duplicate init.");
} else {
    window.innoverEngineInitialized = true;
    let lenis;

    // Force Page Visibility immediately if wrappers are missing
    const forceReveal = () => {
        const wrap = document.getElementById('page-wrap');
        if (wrap) {
            wrap.style.opacity = '1';
            wrap.classList.add('is-visible');
        } else {
            document.body.style.opacity = '1';
            console.log("📢 Innover: #page-wrap missing, revealing body directly.");
        }
    };
    
    // Reveal after 2 seconds regardless of loader status (fail-safe)
    setTimeout(forceReveal, 2000);


document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Innover Engine: Initializing...");
    
    // Register GSAP Plugins
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        console.log("✅ GSAP & ScrollTrigger: Ready");
    }

    // Initialize Lenis
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            smoothTouch: false,
            touchMultiplier: 2,
        });
        window.lenis = lenis;
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
            if (window._homeScrollVideo && !window._homeScrollVideo.seeking && window._homeScrollVideo.readyState >= 2) {
                const targetTime = window.videoProxy.currentTime;
                if (Math.abs(window._homeScrollVideo.currentTime - targetTime) > 0.01) {
                    window._homeScrollVideo.currentTime = targetTime;
                }
            }
        });
        gsap.ticker.lagSmoothing(0);
        console.log("✅ Lenis: Smooth Scroll Synced");
    }

    // CRITICAL: Initialize Hero logic BEFORE the loader fires
    if (typeof initHeroEntrance === 'function') {
        initHeroEntrance();
    }

    // Start Loader
    initLoader();
});
}

/**
 * Cinematic Loader Sequence
 */
function initLoader() {
    const loader = document.getElementById('loader');
    const pageWrap = document.getElementById('page-wrap');
    
    // Resilience: If loader is missing, just show the page and fire entrance
    if (!loader) {
        if (pageWrap) pageWrap.classList.add('is-visible');
        window.dispatchEvent(new CustomEvent('loaderFinished'));
        return;
    }

    const v1 = document.getElementById('heroV1');
    const v2 = document.getElementById('heroV2');
    const p1 = loader.querySelector('.li-p1');
    const p2 = loader.querySelector('.li-p2');

    // 1. Force top on refresh
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    // 2. Check session state
    const isReload = performance.getEntriesByType("navigation")[0]?.type === "reload";
    if (sessionStorage.getItem('loaderPlayed') && !isReload) {
        loader.style.display = 'none';
        document.body.classList.add('skip-loader');
        if (pageWrap) pageWrap.classList.add('is-visible');
        if (v2) { v2.style.opacity = '1'; v2.play().catch(() => {}); }
        if (v1) { v1.style.opacity = '0'; v1.pause(); }
        window._heroCrossfadeDone = true;
        return;
    }

    sessionStorage.setItem('loaderPlayed', 'true');

    // 3. Scroll Lock during intro
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();

    // 4. SVG Drawing
    if (p1 && p2) {
        const L1 = Math.ceil(p1.getTotalLength());
        const L2 = Math.ceil(p2.getTotalLength());
        p1.style.strokeDasharray = `${L1} ${L1}`;
        p1.style.strokeDashoffset = L1;
        p2.style.strokeDasharray = `${L2} ${L2}`;
        p2.style.strokeDashoffset = L2;

        setTimeout(() => {
            p1.style.transition = 'stroke-dashoffset 1400ms cubic-bezier(0.43,0.05,0.08,1)';
            p1.style.strokeDashoffset = 0;
        }, 350);

        setTimeout(() => {
            p2.style.transition = 'stroke-dashoffset 420ms cubic-bezier(0.0,0.0,0.2,1)';
            p2.style.strokeDashoffset = 0;
        }, 1130);

        setTimeout(() => {
            [p1, p2].forEach(el => {
                el.style.transition = 'fill 0.5s ease, stroke-width 0.5s ease';
                el.style.fill = '#ffffff';
                el.style.strokeWidth = '0';
            });
        }, 1800);
    }

    // 5. Cleanup & Exit
    setTimeout(() => {
        loader.classList.add('exit');
        if (pageWrap) pageWrap.classList.add('is-visible');
        
        setTimeout(() => {
            document.body.style.overflow = '';
            if (lenis) lenis.start();
            ScrollTrigger.refresh();
        }, 4500);

        setTimeout(() => {
            loader.style.display = 'none';
            window.dispatchEvent(new CustomEvent('loaderFinished'));
        }, 1600);
    }, 4300);
}

// ═══════════════════════════════════════════════════════════════
// 2. VIDEO & ELEMENT REFERENCES
// ═══════════════════════════════════════════════════════════════

    // Auto-fix broken Webflow Cloudinary URLs to GitHub
    const bgVideos = {
      'heroV1': 'https://cdn.jsdelivr.net/gh/dareiovisuals/assets@main/innover/video/hero01.mp4',
      'heroV2': 'https://cdn.jsdelivr.net/gh/dareiovisuals/assets@main/innover/video/hero02.mp4',
      'homeScrollVideo': 'https://cdn.jsdelivr.net/gh/dareiovisuals/assets@main/innover/video/homescroll.mp4'
    };
    for (const [id, url] of Object.entries(bgVideos)) {
      const el = document.getElementById(id);
      if (el) {
        const v = el.tagName === 'VIDEO' ? el : el.querySelector('video');
        if (v && v.src !== url) { v.src = url; if(typeof v.load === 'function') v.load(); }
      }
    }

    // Safely get video elements from Webflow's div wrappers
    const getVid = (id) => {
      const el = document.getElementById(id);
      return el && el.tagName === 'VIDEO' ? el : (el ? el.querySelector('video') : null);
    };

    // ── Element references ──
    const heroV1Wrapper   = document.getElementById('heroV1');
    const heroV2Wrapper   = document.getElementById('heroV2');
    const homeScrollWrapper = document.getElementById('homeScrollVideo');
    
    const heroV1          = getVid('heroV1');
    const heroV2          = getVid('heroV2');
    const homeScrollVideo = getVid('homeScrollVideo');
    window._homeScrollVideo = homeScrollVideo;
    window.videoProxy = { currentTime: 0 };

    // ── Global Video Variables ──
    const heroVideoWrap   = document.querySelector('.hero-video-wrap');
    const heroTitle       = document.querySelector('.hero-title');
    const heroSub         = document.querySelector('.hero-sub');
    const heroActions     = document.querySelector('.hero-actions');
    const heroEyebrow     = document.querySelector('.hero-eyebrow');
    const heroStats       = document.querySelector('.hero-stats');
    const heroScrollEl    = document.querySelector('.hero-scroll');

    // ─────────────────────────────────────────────────────────────
    // 3. HERO ENTRANCE & CHARACTER SPLIT
    // ─────────────────────────────────────────────────────────────
    
    function initHeroEntrance() {
        console.log("🎭 Hero: Preparing Character Split...");
        const GRADIENT = 'linear-gradient(90deg, #1E65FF 0%, #60A5FA 45%, #FACC15 80%, #FFD700 100%)';

        function charsFrom(text, parent) {
            // Deep Clean: remove invisible Webflow newlines and normalize spaces
            const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ');
            cleanText.split('').forEach(ch => {
                const s = document.createElement('span');
                s.className = 'hero-char';
                s.textContent = ch === ' ' ? '\u00A0' : ch;
                parent.appendChild(s);
            });
        }

        function splitWord(wordEl) {
            const snapshot = Array.from(wordEl.childNodes);
            wordEl.innerHTML = '';
            snapshot.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    charsFrom(node.textContent, wordEl);
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const clone = document.createElement(node.tagName.toLowerCase());
                    Array.from(node.attributes).forEach(a => clone.setAttribute(a.name, a.value));
                    charsFrom(node.textContent, clone);
                    wordEl.appendChild(clone);
                }
            });
        }

        function applyGradientToChars(wordEl) {
            const wordRect = wordEl.getBoundingClientRect();
            const wordWidth = wordRect.width || wordEl.offsetWidth || 200;
            wordEl.querySelectorAll('.hero-char').forEach(char => {
                const charRect = char.getBoundingClientRect();
                const offset = charRect.left - wordRect.left;
                char.style.background = GRADIENT;
                char.style.backgroundSize  = wordWidth + 'px 100%';
                char.style.backgroundPosition = (-offset) + 'px 0';
                char.style.webkitBackgroundClip = 'text';
                char.style.backgroundClip = 'text';
                char.style.webkitTextFillColor = 'transparent';
                char.style.color = 'transparent';
            });
        }

        document.querySelectorAll('.hero-title-word, .heading-xl-word').forEach((word, i) => {
            console.log("🎭 Splitting word:", word.innerText);
            splitWord(word);
            if (word.classList.contains('is-gradient')) applyGradientToChars(word);
        });

        // Entrance Timeline
        const _innoverHeroEntranceTimeline = gsap.timeline({ paused: true });
        _innoverHeroEntranceTimeline.from('.hero-char', {
            y: 100,
            opacity: 0,
            stagger: 0.02,
            duration: 1,
            ease: 'power4.out'
        });
    }

    // Call hero entrance when loader finishes (hook into initLoader cleanup)
    window.addEventListener('loaderFinished', () => {
        console.log("🎬 Loader Finished: Playing Hero Entrance");
        gsap.to('.hero-char', { y: 0, opacity: 1, stagger: 0.02, duration: 1, ease: 'power4.out' });
    });

    // ─────────────────────────────────────────────────────────────
    // 4. MASTER RESPONSIVE ENGINE (MATCHMEDIA)
    // ─────────────────────────────────────────────────────────────
    const mm = gsap.matchMedia();

    mm.add("(min-width: 861px)", () => {
        // DESKTOP ONLY: Full Cinematic Experience
        
        // Master Hero Exit
        const heroTl = gsap.timeline({
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: '+=80%',
                scrub: 0.1,
            }
        });

        heroTl.to('.hero-title .hero-char', {
            y: -120, opacity: 0, force3D: true,
            ease: 'power2.out',
            stagger: { each: 0.012, from: 'start' },
            duration: 0.55,
        }, 0);

        heroTl.to([heroEyebrow, heroSub, heroScrollEl], {
            y: -60, opacity: 0, force3D: true, ease: 'power2.out', duration: 0.5,
        }, 0);

        if (heroV1 && heroV2) {
            heroTl.to([heroV1, heroV2], { scale: 1.35, force3D: true, duration: 1 }, 0);
            heroTl.to(heroV1, { opacity: 0, duration: 0.8 }, 0);
            heroTl.to(heroV2, { opacity: 0.4, duration: 0.8 }, 0);
        }

        // Initialize Video Scrub (The Grand Swap)
        initVideoScrub();

        // Portfolio Dome Glow
        const pfSection = document.querySelector('#portfolio-showcase');
        if (pfSection) {
            const glowDome = document.getElementById('pf-dome-rising');
            if (glowDome) {
                const domeTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: pfSection,
                        start: 'top bottom',
                        end: 'center center',
                        scrub: 1.5,
                    }
                });
                domeTl.to(glowDome, { y: '-10vw', opacity: 0.75, ease: 'none', duration: 0.8 })
                      .to(glowDome, { scale: 2.5, opacity: 1, ease: 'power2.in', duration: 0.2 });
            }
        }
        
        return () => { /* Cleanup if needed */ };
    });

    mm.add("(max-width: 860px)", () => {
        // MOBILE ONLY: Performance Optimized
        gsap.set('.hero-title .hero-char', { opacity: 1, y: 0 });
        if (heroV2) heroV2.style.opacity = '0.6';
        
        // Simplified Hero Exit
        gsap.to('#hero', {
            opacity: 0,
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    });

    // ─────────────────────────────────────────────────────────────
    // PHASE 2 — CROSSFADE & VIDEO SCRUB
    // ─────────────────────────────────────────────────────────────
    function initVideoScrub() {
      if (!homeScrollVideo) return;

      homeScrollVideo.currentTime = 0; // hard freeze at frame 0 on init

      // Video Scrub Timeline
      ScrollTrigger.create({
        trigger: '#e2e-statement',
        start: 'top 80%',
        endTrigger: 'body',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          if (homeScrollVideo.duration) {
            window.videoProxy.currentTime = self.progress * (homeScrollVideo.duration - 0.05);
          }
        }
      });

      // The "Grand Swap" & Cinematic Frame Expansion
      const grandSwapV2 = heroV2Wrapper; // Animate the wrapper!
      const dimOverlay = document.querySelector('.statement-dim-overlay');
      const heroOverlay = document.querySelector('.hero-overlay-gradient');
      const ctaFrame = document.getElementById('cta-sticky-frame');
      
      ScrollTrigger.create({
        trigger: '#e2e-statement',
        start: 'top 50%',
        endTrigger: 'footer',
        end: 'top 80%',
        scrub: true,
        onUpdate: (self) => {
          const expandProgress = Math.min(1, self.progress * 4);
          
          if (grandSwapV2) gsap.set(grandSwapV2, { opacity: 0.4 * (1 - expandProgress) });
          if (dimOverlay) gsap.set(dimOverlay, { opacity: 1 - (expandProgress * 0.7) });
          if (heroOverlay) gsap.set(heroOverlay, { opacity: 1 - (expandProgress * 0.7) });
          
          const p = 1 - expandProgress;
          
          // 🚨 Adjusted to start at the BOTTOM instead of the MIDDLE
          // p goes from 1 (start) to 0 (fully expanded)
          const topInset = 85 * p;      // Crops 85% from the top, pushing the slit down
          const bottomInset = 5 * p;    // Crops 5% from the bottom
          const xInset = 30 * p;
          const radius = 24 * p;
          
          if (homeScrollWrapper) {
            gsap.set(homeScrollWrapper, { 
              autoAlpha: expandProgress,
              clipPath: `inset(${topInset}% ${xInset}% ${bottomInset}% ${xInset}% round ${radius}px)`,
              filter: 'brightness(1)'
            });
          }

          if (ctaFrame) {
            gsap.set(ctaFrame, {
              opacity: expandProgress,
              pointerEvents: expandProgress > 0.05 ? 'auto' : 'none',
              clipPath: `inset(${topInset}% ${xInset}% ${bottomInset}% ${xInset}% round ${radius}px)`
            });
            // Fade in the dark gradient overlays inside the frame
            const ctaAlpha = Math.max(0, Math.min(1, (self.progress - 0.3) / 0.5));
            gsap.set('.cta-top-strip > div:first-child, .cta-bottom-strip > div:first-child', { opacity: ctaAlpha });
          }
        }
      });
    }

    // Initialize video scrub immediately. The timeline checks for duration internally.
    initVideoScrub();

    // ─────────────────────────────────────────────────────────────
    // PHASE 3 — PREMIUM STATEMENT (Word-by-Word Sequential Reveal)
    // 350vh section gives ample room for:
    //   Phase A (0–1.0): dim in, Group 1 words stagger in word-by-word
    //   Phase B (1.5–2.5): Group 2 words stagger in, paragraph slides in from right
    //   Phase C (hold): user reads the full statement
    //   Phase D (exit): all elements drift up and blur out together
    // ─────────────────────────────────────────────────────────────
    if (document.getElementById('parallax-spacer')) {
      const group1Words = gsap.utils.toArray('.stmt-group-1 .stmt-word');
      const group2Words = gsap.utils.toArray('.stmt-group-2 .stmt-word');

      // Initialize group 2 as invisible (will be revealed mid-scroll)
      gsap.set('.stmt-group-2', { opacity: 0 });
      gsap.set(group2Words, { y: 50, opacity: 0, filter: 'blur(6px)' });
      // Right panel slides in from right
      gsap.set('.statement-bottom', { opacity: 0, x: 40, filter: 'blur(10px)' });

      const statementTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.statement-wrapper',
          start: 'top 85%',
          end: 'bottom 15%',
          scrub: 0.2,  // immediate response, no lag
        }
      });

      // Phase A — Dim + Group 1 words fly in immediately
      statementTl.to('.statement-dim-overlay', { opacity: 1, duration: 0.5, ease: 'power2.inOut' }, 0);
      statementTl.fromTo(group1Words,
        { y: 50, opacity: 0, filter: 'blur(6px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.09, duration: 0.5, ease: 'power3.out', force3D: true },
        0.1
      );

      // Phase B — Group 2 + right panel, sooner
      statementTl.to('.stmt-group-2', { opacity: 1, duration: 0.01, ease: 'none' }, 0.9);
      statementTl.fromTo(group2Words,
        { y: 50, opacity: 0, filter: 'blur(6px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.09, duration: 0.5, ease: 'power3.out', force3D: true },
        0.9
      );
      statementTl.to('.statement-bottom',
        { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' },
        0.85
      );

      // No long hold phase needed since it scrolls naturally
      // statementTl.to({}, { duration: 0.8 });

      // Phase D — Exit: fast, clean
      statementTl.to(['.stmt-group-1', '.stmt-group-2', '.statement-bottom'], {
        y: -70, opacity: 0, filter: 'blur(8px)',
        stagger: 0.06, duration: 1.0, ease: 'power2.in'
      }, '>');
    }

    // ─────────────────────────────────────────────────────────────
    // SERVICES: Cinematic Text — Sequential Word Reveal
    // ─────────────────────────────────────────────────────────────
    if (document.getElementById('services-sequence-track')) {
      const lens = document.querySelector('.expansion-lens');
      const sb1Words = gsap.utils.toArray('.service-block-01 .service-word');
      const sb1Para = document.querySelector('.service-block-01 .sb-para');
      const sb1Tag = document.querySelector('.service-block-01 .service-tag');
      const sb1Features = gsap.utils.toArray('.service-block-01 .service-feature');
      
      const sb2Words = gsap.utils.toArray('.service-block-02 .service2-word');
      const sb2Hook = document.querySelector('.service-block-02 .sb2-hook');
      const sb2Para = document.querySelector('.service-block-02 .sb2-para');
      const sb2Tag = document.querySelector('.service-block-02 .service2-tag');
      const sb2ListItems = gsap.utils.toArray('.service-block-02 .sb2-list-item');

      // Hard initial states
      gsap.set(lens, { opacity: 1 });
      gsap.set('.service-block-01', { opacity: 1 });
      gsap.set('.service-block-02', { opacity: 1 });
      gsap.set([sb1Words, sb1Para, sb1Tag, sb1Features, sb2Words, sb2Hook, sb2Para, sb2Tag, sb2ListItems], { opacity: 0, y: 40 });
      if (homeScrollVideo) gsap.set(homeScrollVideo, { autoAlpha: 0 });

      const lensTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#services-sequence-track',
          start: 'top 75%',
          end:   'bottom bottom',
          scrub: 0.1,
        }
      });

      // BLOCK 1 (Corporate Events): Enter
      lensTl.to(sb1Tag, { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.01);
      lensTl.to(sb1Words, { opacity: 1, y: 0, stagger: 0.012, duration: 0.12, ease: 'power2.out' }, 0.02);
      lensTl.to(sb1Para, { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.06);
      lensTl.to(sb1Features, { opacity: 1, y: 0, stagger: 0.025, duration: 0.12, ease: 'power2.out' }, 0.08);

      // BLOCK 1: Exit — fast sweep up
      lensTl.to([sb1Tag, sb1Words, sb1Para, sb1Features], {
        opacity: 0, y: -30, stagger: 0.008, duration: 0.10, ease: 'power2.in'
      }, 0.38);

      // BLOCK 2 (Virtual Events): Enter — starts immediately after block 1 exits (no gap)
      lensTl.to(sb2Tag, { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.46);
      lensTl.to(sb2Words, { opacity: 1, y: 0, stagger: 0.012, duration: 0.12, ease: 'power2.out' }, 0.48);
      lensTl.to(sb2Hook, { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.51);
      lensTl.to(sb2ListItems, { opacity: 1, y: 0, stagger: 0.015, duration: 0.12, ease: 'power2.out' }, 0.53);

      // BLOCK 2: Exit
      lensTl.to([sb2Tag, sb2Words, sb2Hook, sb2ListItems], {
        opacity: 0, y: -30, stagger: 0.004, duration: 0.10, ease: 'power2.in'
      }, 0.85);
    }

    // ─────────────────────────────────────────────────────────────
    // PORTFOLIO — Ken Burns scroll parallax
    // Each image scales up slightly as it scrolls into view, creating a
    // cinematic "breathing" effect. The scale resets as it leaves.
    // ─────────────────────────────────────────────────────────────
    document.querySelectorAll('.portfolio-item').forEach((card, i) => {
      const img = card.querySelector('img');
      if (!img) return;

      // The card clips the image (overflow:hidden), so the image can scale
      // without the card itself changing size.
      gsap.fromTo(img,
        { scale: 1.06, y: 20 },
        {
          scale: 1.0, y: -20, ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          }
        }
      );

      // Subtle entrance: card rises in from below
      gsap.fromTo(card,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, ease: 'power2.out', duration: 0.8,
          delay: i * 0.08,
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // ── Sticky nav (uses Lenis scroll — compatible with smooth scroll proxy) ──
    const navbar = document.getElementById('navbar');
    lenis.on('scroll', ({ scroll }) => {
      navbar.classList.toggle('scrolled', scroll > 60);
    });

    // ── Mobile menu ──
    const openBtn  = document.getElementById('openMenu');
    const closeBtn = document.getElementById('closeMenu');
    const menu     = document.getElementById('mobileMenu');
    openBtn.addEventListener('click', () => {
      menu.classList.add('open');
      openBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    });
    closeBtn.addEventListener('click', () => {
      menu.classList.remove('open');
      openBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });

    // ═══════════════════════════════════════════════════════════════
    // PREMIUM SECTION ANIMATIONS
    // Uses IntersectionObserver for reliable entry detection (immune to
    // Lenis scroll proxy issues), then fires GSAP for all motion.
    // ═══════════════════════════════════════════════════════════════

    function premiumReveal() {
      // Build a GSAP fromTo that plays when el enters viewport.
      // threshold: how much of the element must be visible to trigger.
      function onEnter(els, fromVars, toVars, threshold = 0.01) {
        const targets = Array.isArray(els) ? els : [els];
        // Set all targets to from-state immediately (so they're hidden)
        gsap.set(targets, fromVars);
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            gsap.to(targets, { ...toVars });
          });
        }, { threshold });
        // Observe the first element as the trigger point
        observer.observe(targets[0]);
      }

      // Staggered version: observes one trigger, animates a selector
      function onEnterSelector(triggerEl, selector, fromVars, toVars, threshold = 0.01) {
        const targets = document.querySelectorAll(selector);
        if (!targets.length) return;
        gsap.set(targets, fromVars);
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            gsap.to(targets, { ...toVars });
          });
        }, { threshold });
        observer.observe(triggerEl);
      }

      // ── TRUST STRIP ──────────────────────────────────────────────
      const trustSection = document.querySelector('#trust');
      if (trustSection) {
        onEnterSelector(trustSection, '.trust-item',
          { y: 50, opacity: 0, scale: 0.94 },
          { y: 0, opacity: 1, scale: 1, stagger: 0.1, ease: 'power3.out', duration: 0.75 }
        );
        // Count-up for trust numbers
        const trustNums = trustSection.querySelectorAll('.trust-num');
        const trustData = [
          { target: 150, suffix: '<span>+</span>' },
          { target: 98,  suffix: '<span>%</span>' },
          { target: 40,  suffix: '<span>k+</span>' },
          { target: 5,   suffix: '<span>+</span>' },
        ];
        trustNums.forEach((el, i) => {
          if (!trustData[i]) return;
          el.innerHTML = '0' + trustData[i].suffix;
          let done = false;
          const obs = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting || done) return;
            done = true;
            obs.disconnect();
            const obj = { val: 0 };
            gsap.to(obj, {
              val: trustData[i].target, duration: 1.6, ease: 'power2.out',
              onUpdate: () => { el.innerHTML = Math.round(obj.val) + trustData[i].suffix; }
            });
          }, { threshold: 0.1 });
          obs.observe(el);
        });
      }

      // ── SERVICES ─────────────────────────────────────────────────
      const servSection = document.querySelector('#services');
      if (servSection) {
        // Section header
        const servHdr = [servSection.querySelector('.tag'), servSection.querySelector('.section-title'), servSection.querySelector('.section-sub')].filter(Boolean);
        if (servHdr.length) onEnter(servHdr, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, ease: 'power3.out', duration: 0.85 });
        // Cards: clip-path curtain reveal
        onEnterSelector(servSection, '.service-card',
          { y: 60, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
          { y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', stagger: 0.12, ease: 'power3.out', duration: 0.8 }
        );
        // Icons pop in
        const icons = servSection.querySelectorAll('.service-icon');
        icons.forEach((icon, i) => {
          gsap.set(icon, { scale: 0, rotate: -15, opacity: 0 });
          const obs = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            obs.disconnect();
            gsap.to(icon, { scale: 1, rotate: 0, opacity: 1, ease: 'back.out(2)', duration: 0.6, delay: i * 0.12 + 0.3 });
          }, { threshold: 0.01 });
          obs.observe(servSection);
        });
      }

      // ── WHY INNOVER ───────────────────────────────────────────────
      const whySection = document.querySelector('#why');
      if (whySection) {
        const whyHdr = [whySection.querySelector('.tag'), whySection.querySelector('.section-title'), whySection.querySelector('.section-sub')].filter(Boolean);
        if (whyHdr.length) onEnter(whyHdr, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, ease: 'power3.out', duration: 0.85 });
        onEnterSelector(whySection, '.why-card',
          { x: -40, y: 30, opacity: 0 },
          { x: 0, y: 0, opacity: 1, stagger: 0.14, ease: 'power3.out', duration: 0.8 }
        );
        onEnterSelector(whySection, '.why-card-num',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.14, ease: 'power2.out', duration: 0.7 }
        );
        onEnterSelector(whySection, '.why-accent',
          { scaleX: 0 },
          { scaleX: 1, transformOrigin: 'left', stagger: 0.14, ease: 'power3.out', duration: 0.5 }
        );
      }

      // ── TESTIMONIALS ──────────────────────────────────────────────
      const testSection = document.querySelector('#testimonials');
      if (testSection) {
        const testHdr = [testSection.querySelector('.tag'), testSection.querySelector('.section-title'), testSection.querySelector('.section-sub')].filter(Boolean);
        if (testHdr.length) onEnter(testHdr, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, ease: 'power3.out', duration: 0.85 });
        onEnterSelector(testSection, '.testimonial-card',
          { y: 50, x: 16, opacity: 0, rotateX: 6 },
          { y: 0, x: 0, opacity: 1, rotateX: 0, stagger: 0.15, ease: 'power3.out', duration: 0.85, transformOrigin: 'top center' }
        );
        onEnterSelector(testSection, '.quote-mark',
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 0.6, stagger: 0.15, ease: 'back.out(1.8)', duration: 0.6 }
        );
      }

      // ── CTA SECTION ───────────────────────────────────────────────
      const ctaSection = document.querySelector('#cta');
      if (ctaSection) {
        const ctaEls = [
          ctaSection.querySelector('.tag'),
          ctaSection.querySelector('.section-title'),
          ctaSection.querySelector('.section-sub'),
          ctaSection.querySelector('.cta-actions'),
          ctaSection.querySelector('.cta-trust'),
        ].filter(Boolean);
        gsap.set(ctaEls, { y: 30, opacity: 0 });
        const obs = new IntersectionObserver((entries) => {
          if (!entries[0].isIntersecting) return;
          obs.disconnect();
          ctaEls.forEach((el, i) => {
            gsap.to(el, { y: 0, opacity: 1, ease: 'power3.out', duration: 0.75, delay: i * 0.11 });
          });
        }, { threshold: 0.01 });
        obs.observe(ctaSection);
      }

      // ── FOOTER ────────────────────────────────────────────────────
      const footer = document.querySelector('footer');
      if (footer) {
        onEnterSelector(footer, '.footer-brand, .footer-col',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, ease: 'power2.out', duration: 0.7 }
        );
      }
      // ── PORTFOLIO SHOWCASE ─────────────────────────────────────────
      const pfSection = document.querySelector('#portfolio-showcase');
      if (pfSection) {
        const pfEyebrow  = pfSection.querySelector('#pf-eyebrow');
        const pfHeadline = pfSection.querySelector('.portfolio-headline');

        // ── DOME GLOW: Continuous scroll-bound rising arc ──
        const glowDome = document.getElementById('pf-dome-rising');
        if (glowDome) {
          gsap.set(glowDome, { 
            opacity: 0, 
            y: '20vw', 
            scale: 1, 
            filter: 'blur(50px)',
            background: 'radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.95) 10%, rgba(30, 64, 175, 0.6) 35%, rgba(15, 23, 42, 0.3) 60%, transparent 80%)'
          });

          const domeTl = gsap.timeline({
            scrollTrigger: {
              trigger: pfSection,
              start: 'top bottom',           
              end: 'center center',
              scrub: 1.5,
              onLeaveBack: () => {
                gsap.set(glowDome, { opacity: 0, y: '20vw', scale: 1 });
              },
            }
          });

          domeTl.to(glowDome, {
            y: '-10vw',
            opacity: 0.75,
            ease: 'none',
            duration: 0.8 
          })
          .to(glowDome, {
            scale: 2.5,
            opacity: 1, 
            ease: 'power2.in',
            duration: 0.2 
          });
        }

        // ── 2. EYEBROW: slides up ──
        if (pfEyebrow) {
          gsap.set(pfEyebrow, { y: 20, opacity: 0 });
          ScrollTrigger.create({
            trigger: pfEyebrow, start: 'top 92%',
            onEnter:     () => gsap.to(pfEyebrow, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }),
            onLeaveBack: () => gsap.set(pfEyebrow, { y: 20, opacity: 0 }),
          });
        }

        // ── 3. HEADLINE: word-curtain reveal ──
        if (pfHeadline) {
          // Split headline into words manually
          const words = pfHeadline.innerText.split(' ');
          pfHeadline.innerHTML = words.map(w => `<span class="pf-word-wrap" style="display:inline-block; overflow:hidden;"><span class="pf-word" style="display:inline-block;">${w}&nbsp;</span></span>`).join('');
          
          const pfWords = pfHeadline.querySelectorAll('.pf-word');
          gsap.set(pfWords, { y: '115%' });
          
          ScrollTrigger.create({
            trigger: pfHeadline, start: 'top 92%',
            onEnter: () => gsap.to(pfWords, {
              y: '0%',
              duration: 1.05,
              ease: 'power4.out',
              stagger: 0.11,
              delay: 0.1,
            }),
            onLeaveBack: () => gsap.set(pfWords, { y: '115%' }),
          });
        }
      }
    }

    // ════ 3B. TESTIMONIALS (KINETIC CARDS) ════
    function initTestimonials() {
      const sequence = document.getElementById('testimonial-sequence');
      if (!sequence) return;

      // 1. Stagger Entrance
      const cards = gsap.utils.toArray('.kinetic-testimonial-card');
      const testiWords = gsap.utils.toArray('.testi-word');

      gsap.set(cards, { y: 100, opacity: 0 });
      gsap.set(testiWords, { y: 50, opacity: 0, filter: 'blur(6px)' });
      
      ScrollTrigger.create({
        trigger: sequence,
        start: 'top 70%',
        onEnter: () => {
          gsap.to(testiWords, {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.5,
            ease: 'power3.out',
            stagger: 0.09,
            force3D: true
          });
          gsap.to(cards, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
            stagger: 0.15,
            delay: 0.2
          });
        }
      });

      // 2. Fade out Portfolio Glow to reveal clean dark blue background
      const glowContainer = document.querySelector('.pf-bg-glow');
      if (glowContainer) {
        gsap.to(glowContainer, {
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sequence,
            start: 'top 80%', // Starts fading as testimonials enter
            end: 'top 20%',   // Fully dark blue by the time they read
            scrub: true
          }
        });
      }
    }

    // ── Final CTA Text Entrance ──
    const finalCtaFrame = document.getElementById('cta-sticky-frame');
    if (document.getElementById('final-cta') && finalCtaFrame) {
      const ctaEyebrow = document.querySelector('.cta-top-content > div');
      const ctaTitle   = document.querySelector('.cta-top-content h2');
      const ctaPara    = document.querySelector('.cta-bottom-content p');
      const ctaBtns    = document.querySelector('.cta-buttons-wrap');
      
      gsap.set([ctaEyebrow, ctaTitle, ctaPara], { y: 60, opacity: 0 });
      gsap.set(ctaBtns, { y: 60, opacity: 0, scale: 0.85 });

      ScrollTrigger.create({
        trigger: '#final-cta',
        start: 'top 50%',
        onEnter: () => {
          gsap.to([ctaEyebrow, ctaTitle, ctaPara, ctaBtns], {
            y: 0, opacity: 1, scale: 1,
            duration: 1.2, stagger: 0.15, ease: 'power3.out', force3D: true, delay: 0.1
          });
        },
        onLeaveBack: () => {
          gsap.to([ctaEyebrow, ctaTitle, ctaPara, ctaBtns], {
            y: 30, opacity: 0, scale: 0.85,
            duration: 0.2, ease: 'power2.in', force3D: true, overwrite: true
          });
        }
      });
    }

    // Run section animations after all ScrollTriggers and element references are ready
    premiumReveal();
    initTestimonials();

// ── Form Validation Animations ──
document.addEventListener('DOMContentLoaded', () => {
    const allInputs = document.querySelectorAll('.smart-input, input[type="radio"], input[type="checkbox"], select, .footer-quick-form input, .footer-quick-form textarea');
    const allForms = document.querySelectorAll('form');

    function checkFormReady(form) {
      const btn = form.querySelector('.form-submit-btn, .footer-btn-submit');
      if (!btn) return;
      if (form.checkValidity()) {
        btn.classList.add('ready-glow');
      } else {
        btn.classList.remove('ready-glow');
      }
    }

    allInputs.forEach(input => {
      const group = input.closest('.input-group') || input.closest('.footer-input-group') || input.parentElement;

      // Typing animation
      if(input.type === 'text' || input.type === 'email' || input.type === 'tel' || input.type === 'number' || input.tagName === 'TEXTAREA') {
        input.addEventListener('input', () => {
          if (group) group.classList.add('is-typing');
          if (input.value.trim() !== '') {
            if (group) group.classList.add('is-filled');
          } else {
            if (group) group.classList.remove('is-filled');
          }
          checkFormReady(input.closest('form'));
        });
        
        let typeTimeout;
        input.addEventListener('keyup', () => {
          clearTimeout(typeTimeout);
          typeTimeout = setTimeout(() => {
            if (group) group.classList.remove('is-typing');
          }, 300);
        });

        input.addEventListener('blur', () => {
          if (group) group.classList.remove('is-typing');
          if (input.value.trim() !== '') {
            if (group) group.classList.add('is-filled');
          } else {
            if (group) group.classList.remove('is-filled');
          }
        });
      }

      // Handle radios/selects change
      input.addEventListener('change', () => {
        if(input.type === 'radio' || input.tagName === 'SELECT') {
           if (group) group.classList.add('is-filled');
        }
        checkFormReady(input.closest('form'));
      });
    });


// ═══════════════════════════════════════════════════════════════
// 3. PAGE TRANSITIONS (THE CURTAIN)
// ═══════════════════════════════════════════════════════════════
(function () {
  'use strict';

  // 1. Inject the curtain DOM + CSS
  const style = document.createElement('style');
  style.textContent = `
    #pg-curtain {
      position: fixed; inset: 0; z-index: 99999; background: #060a16;
      display: flex; align-items: center; justify-content: center; pointer-events: none;
      transform: translateY(100%); transition: transform 0.75s cubic-bezier(0.76, 0, 0.24, 1);
      will-change: transform;
    }
    #pg-curtain.is-covering { transform: translateY(0%); }
    #pg-curtain.is-leaving { transform: translateY(-100%); }
    #pg-curtain-logo { opacity: 0; transition: opacity 0.35s ease; }
    #pg-curtain.is-covering #pg-curtain-logo { opacity: 1; }
    #pg-curtain::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, #1E65FF 0%, #60A5FA 50%, #FBBF24 100%);
    }
  `;
  document.head.appendChild(style);

  const curtain = document.createElement('div');
  curtain.id = 'pg-curtain';
  curtain.innerHTML = `
    <div id="pg-curtain-logo">
      <svg width="52" height="52" viewBox="350 350 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M447.661 589.433C443.23 583.655 416.282 549.917 452.464 513.45C526.066 439.269 527.078 439.699 527.957 435.784C531.369 420.593 471.246 405.383 442.062 448.156C424.016 474.604 433.585 500.817 433.909 503.363C434.064 504.583 433.829 504.737 415.909 522.581C399.847 538.574 398.745 540.458 397.435 538.009C353.128 455.16 419.654 369.072 498.704 372.587C561.56 375.382 582.255 416.654 575.46 445.897C569.893 469.858 553.814 478.547 485.785 547.788C469.798 564.059 521.456 579.299 551.541 557.728C591.781 528.875 576.285 485.692 577.275 483.987C577.89 482.928 611.196 449.845 611.249 449.809C614.424 447.668 620.485 466.258 620.993 467.816C653.083 566.235 555.231 640.047 478.005 609.61C457.599 601.567 451.325 593.08 447.66 589.434L447.661 589.433Z" fill="white"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M376.263 589.988L393.268 572.983C397.961 568.29 405.581 568.29 410.273 572.983L427.278 589.988C431.971 594.681 431.971 602.301 427.278 606.993L410.273 623.998C405.58 628.691 397.96 628.691 393.268 623.998L376.263 606.993C371.57 602.3 371.57 594.68 376.263 589.988Z" fill="white"/>
      </svg>
    </div>
  `;
  document.body.appendChild(curtain);

  function playEnter() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        curtain.classList.remove('is-covering');
        curtain.classList.add('is-leaving');
      });
    });
  }

  function playExit(href) {
    curtain.classList.remove('is-leaving');
    curtain.classList.add('is-covering');
    curtain.addEventListener('transitionend', function onEnd(e) {
      if (e.propertyName !== 'transform') return;
      curtain.removeEventListener('transitionend', onEnd);
      window.location.href = href;
    });
  }

  // Intercept internal links
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (!link || link.target === '_blank') return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const targetPage  = href.split('/').pop().split('?')[0].split('#')[0] || 'index.html';
    if (currentPage === targetPage) return;

    e.preventDefault();
    playExit(href);
  });

  // Entrance
  if (!window._skipTransitionEnter) {
    curtain.classList.add('is-covering');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(playEnter, 80));
    } else {
      setTimeout(playEnter, 80);
    }
  }

  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      curtain.style.transition = 'none';
      curtain.classList.remove('is-covering', 'is-leaving');
      requestAnimationFrame(() => curtain.style.transition = '');
    }
  });
})();

// ═══════════════════════════════════════════════════════════════
// 4. INTERNAL PAGE COMPONENTS (ABOUT & CONTACT)
// ═══════════════════════════════════════════════════════════════

/**
 * OUR PROCESS — Scroll Engine
 */
function initOurProcess() {
  const track = document.getElementById('processTrack');
  const lineFill = document.getElementById('processLineFill');
  const stepEl = document.getElementById('processStep');
  const nodes = document.querySelectorAll('#our-process .process-node');
  const cards = document.querySelectorAll('#our-process .process-card-item');
  const section = document.getElementById('our-process');
  if (!track || !section) return;

  const TOTAL = 4;
  const NUMS = ['01', '02', '03', '04'];
  let scrollPct = 0, lerpPct = 0, activeIdx = -1;

  function rafLoop() {
    const isMobile = window.innerWidth <= 860;
    if (!isMobile) {
      lerpPct += (scrollPct - lerpPct) * 0.09;
      if (lineFill) { lineFill.style.width = lerpPct.toFixed(3) + '%'; lineFill.style.height = '1px'; }
    }

    let step = 0;
    if (isMobile) {
      const timelineRect = document.querySelector('#our-process .process-timeline')?.getBoundingClientRect();
      if (timelineRect) {
        cards.forEach((card, i) => {
          const cardRect = card.getBoundingClientRect();
          const node = nodes[i];
          if (node) node.style.top = ((cardRect.top + cardRect.height / 2) - timelineRect.top) + 'px';
        });
      }
      let closestDist = Infinity;
      const winCenter = window.innerHeight * 0.55;
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const dist = Math.abs((rect.top + rect.height / 2) - winCenter);
        if (dist < closestDist) { closestDist = dist; step = i; }
      });
      const sectionH = section.offsetHeight;
      const sectionRect = section.getBoundingClientRect();
      const mobPct = Math.min(Math.max(-sectionRect.top / (sectionH - window.innerHeight), 0), 1) * 100;
      lerpPct += (mobPct - lerpPct) * 0.08;
      if (lineFill) { lineFill.style.height = lerpPct.toFixed(3) + '%'; lineFill.style.width = '100%'; }
    } else {
      step = Math.min(Math.floor((scrollPct / 100) * TOTAL), TOTAL - 1);
    }

    if (step !== activeIdx) {
      activeIdx = step;
      if (stepEl) stepEl.textContent = NUMS[step];
      nodes.forEach((n, i) => { n.classList.toggle('is-active', i === step); n.classList.toggle('is-done', i < step); });
      cards.forEach((c, i) => { c.classList.toggle('is-active', i === step); c.classList.toggle('is-done', i < step); });
    }
    requestAnimationFrame(rafLoop);
  }

  function onScroll() {
    const rect = track.getBoundingClientRect();
    scrollPct = Math.min(Math.max(-rect.top / (track.offsetHeight - window.innerHeight) * 100, 0), 100);
  }

  if (window.lenis) window.lenis.on('scroll', onScroll);
  else window.addEventListener('scroll', onScroll, { passive: true });

  onScroll();
  rafLoop();
}

/**
 * OUR APPROACH — Sticky Pillars
 */
function initOurApproach() {
  const track = document.getElementById('approachTrack');
  const fill = document.getElementById('approachFill');
  const navItems = document.querySelectorAll('#our-approach .approach-nav-item');
  const panels = document.querySelectorAll('#our-approach .approach-panel');
  const bgItems = document.querySelectorAll('#our-approach .approach-bg-item');
  const mobTabs = document.querySelectorAll('#our-approach .approach-pill-tab');
  const mobDots = document.querySelectorAll('#our-approach .approach-dot');
  if (!track || panels.length === 0) return;

  const TOTAL = panels.length;
  let active = 0;

  function setActive(idx) {
    if (idx === active && panels[idx].classList.contains('is-active')) return;
    const isMobile = window.innerWidth <= 860;
    panels[active].classList.remove('is-active');
    if (isMobile) {
      panels[active].classList.add(idx > active ? 'mob-exit-left' : 'mob-exit-right');
    } else {
      panels[active].classList.add('is-exiting');
    }
    [navItems, mobTabs, mobDots, bgItems].forEach(list => list[active]?.classList.remove('is-active'));
    const prev = active;
    setTimeout(() => panels[prev].classList.remove('is-exiting', 'mob-exit-left', 'mob-exit-right'), 450);
    active = idx;
    panels[active].classList.add('is-active');
    [navItems, mobTabs, mobDots, bgItems].forEach(list => list[active]?.classList.add('is-active'));
    if (fill) fill.style.width = ((active + 1) / TOTAL * 100) + '%';
  }

  function onScroll() {
    if (window.innerWidth <= 860) return;
    const rect = track.getBoundingClientRect();
    const scrolled = Math.min(Math.max(-rect.top / (track.offsetHeight - window.innerHeight), 0), 1);
    setActive(Math.min(Math.floor(scrolled * TOTAL), TOTAL - 1));
  }

  if (window.lenis) window.lenis.on('scroll', onScroll);
  else window.addEventListener('scroll', onScroll, { passive: true });

  navItems.forEach((item, i) => item.addEventListener('click', () => {
    const trackTop = window.pageYOffset + track.getBoundingClientRect().top;
    const target = trackTop + (i / TOTAL) * (track.offsetHeight - window.innerHeight) + 1;
    if (window.lenis) window.lenis.scrollTo(target, { duration: 1.2 });
    else window.scrollTo({ top: target, behavior: 'smooth' });
  }));

  mobTabs.forEach((tab, i) => tab.addEventListener('click', () => setActive(i)));
  onScroll();
}

/**
 * CONTACT FORM — Toggles & Logic
 */
function initContactForms() {
    const btnGeneral = document.getElementById('btn-general');
    const btnQuote = document.getElementById('btn-quote');
    const toggleBg = document.getElementById('toggle-bg');
    const viewGeneral = document.getElementById('general-form');
    const viewQuote = document.getElementById('quote-form');
    const container = document.getElementById('forms-wrapper');
    if (!btnGeneral || !btnQuote) return;

    function switchForm(target) {
        const isQuote = target === 'quote-form';
        const currentView = isQuote ? viewGeneral : viewQuote;
        const nextView = isQuote ? viewQuote : viewGeneral;
        if (nextView.classList.contains('is-active')) return;

        btnGeneral.classList.toggle('active', !isQuote);
        btnQuote.classList.toggle('active', isQuote);
        if (toggleBg) toggleBg.style.transform = isQuote ? 'translateX(100%)' : 'translateX(0)';

        const startHeight = container.offsetHeight;
        nextView.style.display = 'block';
        nextView.style.opacity = '0';
        const targetHeight = nextView.scrollHeight;

        gsap.to(currentView, { opacity: 0, duration: 0.3, onComplete: () => {
            currentView.classList.remove('is-active');
            currentView.style.display = 'none';
            nextView.classList.add('is-active');
            gsap.to(nextView, { opacity: 1, duration: 0.4 });
        }});
        gsap.to(container, { height: targetHeight, duration: 0.6, ease: 'power3.inOut' });
    }

    btnGeneral.addEventListener('click', () => switchForm('general-form'));
    btnQuote.addEventListener('click', () => switchForm('quote-form'));
}

/**
 * OUR PROMISE — Text Fades
 */
function initOurPromise() {
  const track = document.getElementById('our-promise');
  if (!track) return;
  const frames = track.querySelectorAll('.promise-frame');
  const TOTAL = 4;
  let activeIdx = -1;

  function onScroll() {
    const rect = track.getBoundingClientRect();
    const scrolled = Math.min(Math.max(-rect.top / (track.offsetHeight - window.innerHeight), 0), 1);
    const step = Math.min(Math.floor(scrolled * TOTAL), TOTAL - 1);
    if (step !== activeIdx) {
      activeIdx = step;
      frames.forEach((f, i) => {
        f.classList.toggle('is-active', i === step);
        f.classList.toggle('is-done', i < step);
      });
    }
  }
  if (window.lenis) window.lenis.on('scroll', onScroll);
  else window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/**
 * CONTACT FORM — Submission & Success Animation
 */
function playSuccessAnimation() {
    const succIcon = document.querySelector('.success-loader-icon');
    const succP1 = document.querySelector('.succ-p1');
    const succP2 = document.querySelector('.succ-p2');
    const succContent = document.querySelector('.success-content-anim');

    if (!succP1 || !succP2 || typeof gsap === 'undefined') return;

    // Measure lengths
    const L1 = Math.ceil(succP1.getTotalLength()) || 1600;
    const L2 = Math.ceil(succP2.getTotalLength()) || 130;

    gsap.set([succP1, succP2], { fill: 'transparent', stroke: '#ffffff', strokeWidth: 3, strokeDasharray: L1, strokeDashoffset: L1 });
    gsap.set(succP2, { strokeDasharray: L2, strokeDashoffset: L2 });
    gsap.set(succIcon, { opacity: 0, scale: 0.8 });
    gsap.set(succContent, { opacity: 0, y: 20 });

    const tl = gsap.timeline();
    tl.to(succIcon, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' })
      .to(succP1, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, '-=0.2')
      .to(succP2, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, '-=0.6')
      .to([succP1, succP2], { fill: '#ffffff', strokeWidth: 0, duration: 0.5 }, '-=0.2')
      .to(succContent, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2');
}

async function handleSubmission(e, type) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const viewSuccess = document.getElementById('form-success-state');
    const viewGeneral = document.getElementById('general-form');
    const viewQuote = document.getElementById('quote-form');
    const toggleWrapper = document.querySelector('.form-toggle-wrapper');
    const successText = document.getElementById('success-text');

    if (!btn || !viewSuccess) return;

    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
        const formData = new FormData(form);
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        const result = await response.json();

        if (result.success) {
            if (toggleWrapper) toggleWrapper.style.display = 'none';
            if (viewGeneral) viewGeneral.style.display = 'none';
            if (viewQuote) viewQuote.style.display = 'none';
            viewSuccess.style.display = 'block';

            if (successText) {
                successText.textContent = type === 'quote' 
                    ? 'Thank you for your detailed inquiry. Our team will review your requirements and provide a custom quote within 48 hours.'
                    : 'Thank you for reaching out. We have received your message and will get back to you within 24 hours.';
            }

            playSuccessAnimation();
        } else {
            btn.textContent = 'Error — Try Again';
            btn.disabled = false;
        }
    } catch (err) {
        btn.textContent = 'Error — Try Again';
        btn.disabled = false;
    }
}

// Initializing internal page logic
document.addEventListener('DOMContentLoaded', () => {
    initOurProcess();
    initOurApproach();
    initOurPromise();
    initContactForms();


    // Hook up form submits
    document.addEventListener('submit', (e) => {
        if (e.target.id === 'contact-form-general') handleSubmission(e, 'general');
        if (e.target.id === 'contact-form-quote') handleSubmission(e, 'quote');
    });

    // ── Form Validation & Feedback Glow ──
    const allInputs = document.querySelectorAll('.smart-input, input[type="radio"], input[type="text"], input[type="email"], textarea');
    const allForms = document.querySelectorAll('form');

    function checkFormReady(form) {
        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;
        if (form.checkValidity()) {
            btn.classList.add('ready-glow');
        } else {
            btn.classList.remove('ready-glow');
        }
    }

    allInputs.forEach(input => {
        const group = input.closest('.input-group') || input.closest('.footer-input-group') || input.parentElement;

        input.addEventListener('input', () => {
            if (group) {
                group.classList.add('is-typing');
                group.classList.toggle('is-filled', input.value.trim() !== '');
            }
            checkFormReady(input.closest('form'));
        });

        input.addEventListener('blur', () => {
            if (group) {
                group.classList.remove('is-typing');
                group.classList.toggle('is-filled', input.value.trim() !== '');
            }
        });
    });

    // Initial check for browser autofill
    setTimeout(() => {
        allForms.forEach(form => checkFormReady(form));
        allInputs.forEach(input => {
            if (input.value && input.value.trim() !== '') {
                const group = input.closest('.input-group') || input.closest('.footer-input-group') || input.parentElement;
                if (group) group.classList.add('is-filled');
            }
        });
    }, 100);
});

})();