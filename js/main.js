/* ═══════════════════════════════════════════════════════════════
   محمد حسين — بورتفوليو سينمائي
   Lenis + GSAP ScrollTrigger | بوابة الدخول للعالم الغامق | شروق العودة
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ── 1. Utils ─────────────────────────────────────────────── */
    const qs = (s, el) => (el || document).querySelector(s);
    const qsa = (s, el) => Array.from((el || document).querySelectorAll(s));
    const PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const FINE = window.matchMedia('(pointer: fine)').matches;
    const html = document.documentElement;

    html.classList.add('js');
    if (!PRM) html.classList.add('fx'); // الحالات الأولية المخفية للـ reveal تعمل فقط مع fx

    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    if (hasGSAP) {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ ignoreMobileResize: true });
    } else {
        html.classList.remove('fx'); // فشل تحميل CDN → كل المحتوى ظاهر
    }

    let lenis = null;

    /* ── 2. Smooth scroll (ديسكتوب فقط) ──────────────────────── */
    function initSmoothScroll() {
        if (PRM || !FINE || !hasGSAP || typeof Lenis === 'undefined') return;
        lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    /* ── 3. التنقل عبر الأنكورات (يمر دائماً عبر Lenis إن وُجد) ── */
    function initAnchors() {
        const headerH = 88;
        qsa('.nav-anchor').forEach((a) => {
            a.addEventListener('click', (e) => {
                const id = a.getAttribute('href');
                if (!id || !id.startsWith('#')) return;
                const target = qs(id);
                if (!target) return;
                e.preventDefault();
                if (lenis) {
                    lenis.scrollTo(target, { offset: -headerH, duration: 1.4 });
                } else {
                    target.scrollIntoView({ behavior: PRM ? 'auto' : 'smooth' });
                }
                history.replaceState(null, '', id);
            });
        });
    }

    /* ── 4. الهيدر + زر الصعود (مستمع واحد passive) ─────────── */
    function initHeaderAndScrollTop() {
        const header = qs('#header');
        const topBtn = qs('#scrollTopBtn');

        // بدون GSAP أو مع تقليل الحركة: تبديل جلد الهيدر بحساب حدود العالم الغامق
        const noFX = PRM || !hasGSAP;
        let darkStart = 0, darkEnd = 0;
        const measureDark = () => {
            const portal = qs('#portal');
            const dawn = qs('#dawn');
            if (!portal || !dawn) return;
            darkStart = portal.offsetTop + portal.offsetHeight * 0.5;
            darkEnd = dawn.offsetTop + dawn.offsetHeight * 0.5;
        };
        if (noFX) {
            measureDark();
            window.addEventListener('resize', measureDark, { passive: true });
            window.addEventListener('load', measureDark, { once: true });
        }

        const onScroll = () => {
            const y = window.scrollY;
            header.classList.toggle('scrolled', y > 50);
            topBtn.classList.toggle('visible', y > 400);
            if (noFX) applyDark(y >= darkStart && y < darkEnd);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        topBtn.addEventListener('click', () => {
            if (lenis) lenis.scrollTo(0, { duration: 1.4 });
            else window.scrollTo({ top: 0, behavior: PRM ? 'auto' : 'smooth' });
        });
    }

    /* ── 5. قائمة الموبايل ───────────────────────────────────── */
    function initMobileMenu() {
        const btn = qs('#mobile-menu-btn');
        const menu = qs('#mobile-menu');
        if (!btn || !menu) return;
        const close = () => {
            menu.hidden = true;
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', 'فتح القائمة');
        };
        btn.addEventListener('click', () => {
            const open = menu.hidden;
            menu.hidden = !open;
            btn.setAttribute('aria-expanded', String(open));
            btn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
        });
        menu.addEventListener('click', (e) => {
            if (e.target.closest('a')) close();
        });
        window.addEventListener('scroll', () => {
            if (!menu.hidden) close();
        }, { passive: true });
    }

    /* ── 6. المودالات (dialog أصلي) ──────────────────────────── */
    function initModals() {
        
    }

    /* ── 7. فلاتر الأعمال ────────────────────────────────────── */
    function initFilters() {
        const buttons = qsa('#filter-buttons .filter-btn');
        const cards = qsa('#portfolio-grid .project-card');
        buttons.forEach((btn) => {
            btn.addEventListener('click', () => {
                buttons.forEach((b) => {
                    b.classList.toggle('is-active', b === btn);
                    b.setAttribute('aria-pressed', String(b === btn));
                });
                const filter = btn.dataset.filter;
                cards.forEach((card) => {
                    card.classList.toggle('is-hidden',
                        filter !== 'all' && card.dataset.category !== filter);
                });
                if (hasGSAP) ScrollTrigger.refresh(); console.log('Refresh OK'); // تغيّر ارتفاع الشبكة يحرّك حدود الأقسام
            });
        });
    }

    /* ── 8. نموذج التواصل → واتساب ───────────────────────────── */
    function initContactForm() {
        const form = qs('#contact-form');
        if (!form) return;
        const error = qs('#form-error');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = qs('#name').value.trim();
            const service = qs('#service').value.trim();
            const message = qs('#message').value.trim();
            if (name.length < 2 || message.length < 5) {
                if (error) error.hidden = false;
                return;
            }
            if (error) error.hidden = true;
            let text = 'مرحباً،\nالاسم: ' + name + '\n';
            if (service) text += 'الخدمة المطلوبة: ' + service + '\n';
            text += 'التفاصيل: ' + message;
            
            const url = 'https://wa.me/966538053847?text=' + encodeURIComponent(text);
            // استخدم click() على رابط بدلاً من window.open لتفادي حظر النوافذ المنبثقة في الجوال
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener';
            a.click();
        });
    }

    /* ── 9. استنساخ مجموعة الشركاء (marquee بلا فجوات) ───────── */
    function initMarquee() {
        qsa('.marquee').forEach((m) => {
            const groups = qsa('.marquee-group', m);
            if (groups.length === 2) groups[1].innerHTML = groups[0].innerHTML;
        });
    }

    /* ── 10. كانفاس الهيرو (جزيئات فاتحة) ────────────────────── */
    function initHeroCanvas() {
        const canvas = qs('#hero-canvas');
        if (!canvas || PRM) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let particles = [];
        let rafId = null;
        let running = false;
        let W = 0, H = 0;

        function size() {
            const hero = qs('.hero');
            W = hero.offsetWidth;
            H = hero.offsetHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function build() {
            size();
            particles = [];
            const cap = FINE ? 70 : 40;
            const count = Math.min(cap, Math.floor((W * H) / 20000));
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    r: Math.random() * 2 + 1,
                    vx: Math.random() * 0.4 - 0.2,
                    vy: Math.random() * 0.4 - 0.2,
                });
            }
        }

        function frame() {
            rafId = requestAnimationFrame(frame);
            ctx.clearRect(0, 0, W, H);
            for (const p of particles) {
                if (p.x > W || p.x < 0) p.vx = -p.vx;
                if (p.y > H || p.y < 0) p.vy = -p.vy;
                p.x += p.vx;
                p.y += p.vy;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(62, 198, 168, 0.35)';
                ctx.fill();
            }
            // خطوط ربط خفيفة بين الجزيئات المتقاربة
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < 9000) {
                        ctx.strokeStyle = 'rgba(62, 198, 168, ' + (0.18 * (1 - d2 / 9000)) + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function start() { if (!running) { running = true; frame(); } }
        function stop() { running = false; cancelAnimationFrame(rafId); }

        build();
        new IntersectionObserver((entries) => {
            entries[0].isIntersecting ? start() : stop();
        }).observe(canvas);

        let resizeT;
        window.addEventListener('resize', () => {
            clearTimeout(resizeT);
            resizeT = setTimeout(build, 200);
        }, { passive: true });
    }

    /* ── 11. طبقة الحركة السينمائية (GSAP) ───────────────────── */
    function applyDark(on) {
        html.classList.toggle('in-dark', on);
    }

    function initScrollFX() {
        if (!hasGSAP || PRM) return;

        const mm = gsap.matchMedia();

        /* — حركة افتتاحية للهيرو + العدادات — */
        const intro = gsap.timeline({ paused: true });
        intro.to('#hero .reveal', {
            opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power4.out', stagger: 0.15,
        });
        qsa('.stat-number').forEach((el) => {
            const end = parseInt(el.dataset.count, 10);
            const counter = { v: 0 };
            intro.to(counter, {
                v: end, duration: 1.4, ease: 'power1.out', snap: { v: 1 },
                onUpdate: () => { el.textContent = counter.v; },
            }, 0.5);
        });
        window.__heroIntro = intro; // يشغَّل بعد البريلودر

        /* — reveal لبقية الأقسام (خارج البوابة فقط) — */
        ScrollTrigger.batch('.section .reveal', {
            start: 'top 88%',
            once: true,
            onEnter: (batch) => gsap.to(batch, {
                opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1,
            }),
        });

        /* — البوابة: الكاميرا تدخل الشاشة — */
        mm.add({
            desktop: '(min-width: 768px)',
            mobile: '(max-width: 767px)',
        }, (ctx) => {
            const isDesktop = ctx.conditions.desktop;
            const startScale = isDesktop ? 0.32 : 0.42;
            const viewport = qs('.portal-viewport');

            gsap.set(viewport, { scale: startScale, borderRadius: 28, rotationX: 18, y: 30, transformPerspective: 1200, transformOrigin: 'center center' });

            const tl = gsap.timeline({
                defaults: { ease: 'power2.inOut' },
                onUpdate: function() { applyDark(this.progress() > 0.65); },
                scrollTrigger: {
                    trigger: '#portal',
                    start: 'top top',
                    end: () => '+=' + window.innerHeight * (isDesktop ? 1.5 : 1.0),
                    pin: true,
                    toggleActions: 'play none none reverse',
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    
                    onRefresh: (self) => applyDark(self.progress > 0.85),
                    onUpdate: (self) => { /* handled by timeline */ },
                    // إعادة الرسم بحدة كاملة عند الاستقرار على 1 (لا transform في CSS
                    // لذا clearProps يعادل scale:1 تماماً — بلا قفزة)
                    onLeave: () => gsap.set(viewport, { clearProps: 'transform' }),
                    onEnterBack: () => gsap.set(viewport, { scale: 1 }),
                },
            });

            // الشاشة تتقدم نحو الكاميرا (هضبة ثبات 0.88→1 تضمن حدوداً ساكنة)
            tl.fromTo(viewport, { scale: startScale, rotationX: 18, y: 30 },
                { scale: 1, rotationX: 0, y: 0, duration: 1.6, ease: 'power2.inOut' }, 0);
            
            // Visual entry effect (Cinematic Flash & Glow)
            tl.fromTo('.hall-title', 
                { textShadow: '0 0 0px transparent' }, 
                { textShadow: '0 0 30px rgba(79,227,193,0.8)', duration: 0.2, yoyo: true, repeat: 1 }, 0.88);
            tl.to({}, { duration: 0.12 }, 1.6); // الهضبة

            // النهار ينحسر خلفنا
            if (isDesktop) {
                tl.to('.portal-daylight', {
                    scale: 0.94, autoAlpha: 0, z: -80, duration: 0.55, ease: 'power1.in',
                }, 0);
            } else {
                tl.to('.portal-daylight', { autoAlpha: 0, duration: 0.5 }, 0);
            }

            // سطر الافتتاح والتلميح: ظاهران منذ الوصول، يتلاشيان مع التقدم
            gsap.set('.portal-copy, .portal-hint', { autoAlpha: 1 });
            tl.to('.portal-copy, .portal-hint', { autoAlpha: 0, y: -30, duration: 0.2 }, 0.3);

            // الإطار يذوب وكأن الكاميرا تجاوزته
            tl.to(viewport, { borderRadius: 0, duration: 0.35 }, 0.30);
            tl.fromTo('.portal-bezel', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.25 }, 0.55);

            // الظل السينمائي يحيط ثم ينفتح عند "الوصول"
            if (isDesktop) {
                tl.fromTo('.portal-vignette', { autoAlpha: 0 },
                    { autoAlpha: 0.35, duration: 0.5 }, 0.2);
                tl.to('.portal-vignette', { autoAlpha: 0, duration: 0.15 }, 0.73);
            }

            /* — المعرض الأفقي السينمائي (Horizontal Parallax Portfolio) — */
            const hPortfolio = qs('#horizontal-portfolio');
            const hTrack = qs('#h-track');
            const hPanels = qsa('.h-panel');
            
            if (hPortfolio && hTrack && hPanels.length > 0) {
                const getScrollAmount = () => {
                    // For RTL, scrolling should translate positively to show left items
                    return hTrack.scrollWidth - window.innerWidth;
                };
                
                const hTl = gsap.to(hTrack, {
                    x: getScrollAmount,
                    ease: "none",
                    scrollTrigger: {
                        trigger: hPortfolio,
                        start: "top top",
                        end: () => `+=${hTrack.scrollWidth}`,
                        pin: true,
                        scrub: 1.5,
                        invalidateOnRefresh: true
                    }
                });

                // Parallax Effect for Images inside cards
                qsa('.parallax-img', hPortfolio).forEach((img) => {
                    gsap.fromTo(img, 
                        { x: '-15%' }, 
                        {
                            x: '15%',
                            ease: 'none',
                            scrollTrigger: {
                                trigger: hPortfolio,
                                start: "top top",
                                end: () => `+=${hTrack.scrollWidth}`,
                                scrub: 1.5,
                                invalidateOnRefresh: true
                            }
                        }
                    );
                });
            }

            /* — عالم المسيرة المهنية (CV Horizontal Timeline) — */
            const cvSection = qs('#cv-timeline');
            const cvTrack = qs('#cv-track');
            if (cvSection && cvTrack) {
                gsap.to(cvTrack, {
                    x: () => {
                        // For RTL, scrolling should move elements to the right (positive X)
                        // However, since we want them to slide left as we scroll down, we use positive X.
                        // Wait, in RTL flex containers, items start from right. To see items on the left, we need to translate X positively.
                        return cvTrack.scrollWidth - window.innerWidth;
                    },
                    ease: "none",
                    scrollTrigger: {
                        trigger: cvSection,
                        pin: true,
                        scrub: 1,
                        start: "top top",
                        end: () => `+=${cvTrack.scrollWidth}`,
                        invalidateOnRefresh: true
                    }
                });
            }

            /* — الشروق: العودة إلى النور — */
            const sun = qs('.sun-disc');
            const sunScale = () => {
                const base = 0.1 * Math.max(window.innerWidth, window.innerHeight); // 10vmax
                const need = Math.hypot(window.innerWidth / 2, window.innerHeight * 1.1);
                return (need * 2) / base * 1.1;
            };
            const dawnTl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: '#dawn',
                    start: 'top top',
                    end: () => '+=' + window.innerHeight * 1.5,
                    pin: true,
                    scrub: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => applyDark(self.progress <= 0.5),
                    onRefresh: (self) => { if (self.progress > 0) applyDark(self.progress <= 0.5); },
                },
            });
            dawnTl.fromTo(sun, { scale: 0 },
                { scale: sunScale, duration: 0.7, ease: 'power2.in' }, 0);
            dawnTl.fromTo('.dawn-copy', { autoAlpha: 0, y: 16 },
                { autoAlpha: 1, y: 0, color: '#16283C', duration: 0.2, ease: 'power1.out' }, 0.58);
            dawnTl.to({}, { duration: 0.2 }, 0.8); // هضبة ختامية

            
            /* — معرض الأعمال الأفقي السينمائي (Horizontal Scroll) — */
            const track = qs('#cinematic-track');
            const slides = qsa('.cinematic-slide');
            if (track && slides.length > 0) {
                // Ensure track width is relative to slides
                gsap.set(track, { width: (slides.length * 100) + 'vw' });
                
                const horizontalTl = gsap.to(slides, {
                    xPercent: -100 * (slides.length - 1),
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '#portfolio-cinematic',
                        pin: true,
                        scrub: 1,
                        snap: {
                            snapTo: 1 / (slides.length - 1),
                            duration: {min: 0.2, max: 0.6},
                            delay: 0.1,
                            ease: 'power1.inOut'
                        },
                        end: () => '+=' + track.offsetWidth,
                        invalidateOnRefresh: true,
                    }
                });
            }

            
            

            return () => applyDark(false);
        });

        /* — بارالاكس خفيف للصورة الشخصية — */
        gsap.to('#personal-photo', {
            y: -30,
            ease: 'none',
            scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: true },
        });

        /* — أزرار مغناطيسية (ديسكتوب) — */
        if (FINE) {
            qsa('.btn-magnetic').forEach((btn) => {
                btn.addEventListener('mousemove', (e) => {
                    const r = btn.getBoundingClientRect();
                    gsap.to(btn, {
                        x: (e.clientX - r.left - r.width / 2) * 0.25,
                        y: (e.clientY - r.top - r.height / 2) * 0.25,
                        duration: 0.4, ease: 'power2.out',
                    });
                });
                btn.addEventListener('mouseleave', () => {
                    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
                });
            });
        }
    }

    /* ── 12. البريلودر ───────────────────────────────────────── */
    function initPreloader() {
        const pre = qs('#preloader');
        if (!pre) return;
        const minWait = new Promise((r) => setTimeout(r, 700));
        const loaded = new Promise((r) => {
            if (document.readyState === 'complete') r();
            else window.addEventListener('load', r, { once: true });
        });
        const fonts = document.fonts && document.fonts.ready
            ? document.fonts.ready : Promise.resolve();

        Promise.all([minWait, loaded, fonts]).then(() => {
            pre.classList.add('done');
            setTimeout(() => pre.remove(), 700);
            if (hasGSAP && !PRM) {
                ScrollTrigger.refresh();
                if (window.__heroIntro) window.__heroIntro.play();
            }
        });
        // شبكة أمان: لا يعلق البريلودر أكثر من 5 ثوانٍ مهما حدث
        setTimeout(() => {
            if (document.body.contains(pre)) {
                pre.classList.add('done');
                setTimeout(() => pre.remove(), 700);
                if (window.__heroIntro) window.__heroIntro.play();
            }
        }, 5000);
    }

    /* ── الإقلاع ─────────────────────────────────────────────── */
    function boot() {
        initSmoothScroll();
        initAnchors();
        initHeaderAndScrollTop();
        initMobileMenu();
        initModals();
        initFilters();
        initContactForm();
        initMarquee();
        initHeroCanvas();
        initScrollFX();
        initPreloader();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
