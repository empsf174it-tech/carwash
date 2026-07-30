/**
 * MR.WASH IT — Main JavaScript
 * ---------------------------------------------------------------------------
 *  1. Helpers            5. Before / after slider
 *  2. Shell (nav, theme) 6. Booking wizard (mock)
 *  3. Page furniture     7. Contact form
 *  4. Interactive bay
 * ---------------------------------------------------------------------------
 */

/* ===========================================================================
   1. HELPERS
   ======================================================================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const money = n => '$' + (Math.round(n * 100) / 100).toFixed(n % 1 === 0 ? 0 : 2);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Lock/unlock page scrolling behind an overlay. Both elements need the class —
 *  see the note on `html.no-scroll` in style.css. */
const lockScroll = on => {
    document.documentElement.classList.toggle('no-scroll', on);
    document.body.classList.toggle('no-scroll', on);
};

let toastTimer;
function toast(message, icon = 'ph-fill ph-check-circle') {
    const el = $('#toast');
    if (!el) return;
    $('#toast-text').textContent = message;
    el.querySelector('i').className = icon;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3600);
}

document.addEventListener('DOMContentLoaded', () => {

    /* =======================================================================
       2. SHELL — navbar, drawer, theme, RTL
       ==================================================================== */
    const navbar = $('#navbar');
    const toTop = $('#to-top');

    const onScroll = () => {
        const y = window.scrollY;
        navbar.classList.toggle('scrolled', y > 40);
        toTop.classList.toggle('show', y > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Scroll spy
    const navLinks = $$('.nav-link');
    const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('section[id]').forEach(s => spy.observe(s));

    // Drawer
    const drawer = $('#drawer');
    const drawerOverlay = $('#drawer-overlay');
    const hamburger = $('#hamburger');

    const openDrawer = () => {
        drawer.classList.add('open');
        drawerOverlay.classList.add('open');
        lockScroll(true);
        hamburger.setAttribute('aria-expanded', 'true');
    };
    const closeDrawer = () => {
        drawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
        if (!$('#booking-modal').classList.contains('open')) lockScroll(false);
        hamburger.setAttribute('aria-expanded', 'false');
    };

    hamburger.addEventListener('click', openDrawer);
    $('#close-drawer').addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    // Smooth anchors
    $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href');
            if (id === '#') return;
            const target = $(id);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
            closeDrawer();
        });
    });

    // Theme
    const htmlEl = document.documentElement;
    const THEME_KEY = 'mrwashit_theme';
    const themeToggles = [$('#theme-toggle-desktop'), $('#theme-toggle-mobile')].filter(Boolean);

    const applyTheme = theme => {
        if (theme === 'dark') htmlEl.setAttribute('data-theme', 'dark');
        else htmlEl.removeAttribute('data-theme');
        themeToggles.forEach(btn => {
            const i = btn.querySelector('i');
            if (i) i.className = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
        });
        try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
    };

    let currentTheme;
    try { currentTheme = localStorage.getItem(THEME_KEY); } catch (_) {}
    if (!currentTheme) currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(currentTheme);

    themeToggles.forEach(btn => btn.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(currentTheme);
    }));

    // RTL
    const rtlCss = $('#rtl-css');
    let isRTL = false;
    [$('#rtl-toggle-desktop'), $('#rtl-toggle-mobile')].filter(Boolean).forEach(btn => {
        btn.addEventListener('click', () => {
            isRTL = !isRTL;
            htmlEl.toggleAttribute('dir', false);
            if (isRTL) {
                htmlEl.setAttribute('dir', 'rtl');
                rtlCss && rtlCss.removeAttribute('disabled');
            } else {
                htmlEl.removeAttribute('dir');
                rtlCss && rtlCss.setAttribute('disabled', 'true');
            }
        });
    });

    /* =======================================================================
       3. PAGE FURNITURE — reveal, counters, marquee, FAQ, gallery, hours
       ==================================================================== */

    // Scroll reveal
    const revealIO = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('[data-reveal]').forEach(el => revealIO.observe(el));

    // Animated counters
    const countIO = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseFloat(el.dataset.count);
            const decimals = parseInt(el.dataset.decimals || '0', 10);
            const suffix = el.dataset.suffix || '';
            const duration = reduceMotion ? 0 : 1400;
            const start = performance.now();

            const tick = now => {
                const p = duration ? Math.min((now - start) / duration, 1) : 1;
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = (target * eased).toFixed(decimals) + suffix;
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            obs.unobserve(el);
        });
    }, { threshold: 0.4 });
    $$('[data-count]').forEach(el => countIO.observe(el));

    // Seamless marquee
    const marquee = $('#marquee');
    if (marquee) marquee.innerHTML += marquee.innerHTML;

    // FAQ accordion
    $$('.faq-item').forEach(item => {
        const btn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        btn.addEventListener('click', () => {
            const willOpen = !item.classList.contains('active');
            $$('.faq-item').forEach(f => {
                f.classList.remove('active');
                f.querySelector('.faq-answer').style.maxHeight = null;
            });
            if (willOpen) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // Gallery lightbox
    const lightbox = $('#lightbox');
    const lightboxImg = $('#lightbox-img');
    $$('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (!img) return;
            lightboxImg.src = img.src.replace(/w=\d+/, 'w=1600');
            lightboxImg.alt = img.alt;
            lightbox.classList.add('open');
            lockScroll(true);
        });
    });
    const closeLightbox = () => {
        lightbox.classList.remove('open');
        if (!$('#booking-modal').classList.contains('open')) lockScroll(false);
    };
    $('#lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

    // Highlight today's opening hours
    const todayRow = $(`#hours-list li[data-day="${new Date().getDay()}"]`);
    if (todayRow) todayRow.classList.add('today');

    // Newsletter (mock)
    const newsletter = $('#newsletter-form');
    if (newsletter) {
        newsletter.addEventListener('submit', e => {
            e.preventDefault();
            const input = newsletter.querySelector('input');
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
                toast('That email address looks off.', 'ph-fill ph-warning-circle');
                return;
            }
            input.value = '';
            toast('Subscribed. Watch out for the monthly wash notes.');
        });
    }

    /* =======================================================================
       4. INTERACTIVE WASH BAY — scrub the dirt off
       ==================================================================== */
    (function washBay() {
        const bay = $('#bay');
        const canvas = $('#dirt-canvas');
        if (!bay || !canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: false });
        const cursor = $('#bay-cursor');
        const cursorIcon = cursor.querySelector('.glyph i');
        const fill = $('#clean-fill');
        const value = $('#clean-value');
        const hint = $('#clean-hint');
        const track = $('.progress-track');
        const waterEl = $('#water-used');
        const unlock = $('#washbay-unlock');
        const unlockText = $('#unlock-text');
        const unlockBtn = $('#unlock-btn');

        const TOOLS = {
            sponge: { radius: 40, icon: 'ph-fill ph-hand-soap', label: 'Foam sponge', flow: 0.05, suds: 3, shape: 'round' },
            jet:    { radius: 24, icon: 'ph-fill ph-drop-half', label: 'Pressure jet', flow: 0.11, suds: 5, shape: 'jet' },
            mop:    { radius: 62, icon: 'ph-fill ph-broom',     label: 'Wide mop',    flow: 0.03, suds: 2, shape: 'wide' }
        };

        // Coverage grid — cheap, reliable progress tracking (no getImageData)
        const COLS = 56, ROWS = 40;
        let grid = new Uint8Array(COLS * ROWS);
        let cleared = 0;
        let tool = TOOLS.sponge;
        let scrubbing = false;
        let finished = false;
        let last = null;
        let water = 0;
        let w = 0, h = 0;
        const TARGET = 85;

        /* ---- Dirt layer -------------------------------------------------- */
        function paintDirt() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = bay.getBoundingClientRect();
            w = rect.width; h = rect.height;
            if (!w || !h) return;

            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, w, h);

            // Base grime film
            const base = ctx.createLinearGradient(0, 0, w, h);
            base.addColorStop(0, 'rgba(86, 68, 45, 0.94)');
            base.addColorStop(0.45, 'rgba(64, 52, 36, 0.97)');
            base.addColorStop(1, 'rgba(48, 40, 30, 0.99)');
            ctx.fillStyle = base;
            ctx.fillRect(0, 0, w, h);

            // Mud splatter blobs
            for (let i = 0; i < 90; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                const r = 12 + Math.random() * 70;
                const g = ctx.createRadialGradient(x, y, 0, x, y, r);
                const dark = Math.random() > 0.55;
                g.addColorStop(0, dark ? 'rgba(38, 28, 18, .55)' : 'rgba(120, 98, 66, .45)');
                g.addColorStop(1, 'rgba(70, 56, 38, 0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }

            // Road-spray streaks
            ctx.lineCap = 'round';
            for (let i = 0; i < 34; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h * 0.7;
                ctx.strokeStyle = `rgba(30, 22, 14, ${0.10 + Math.random() * 0.22})`;
                ctx.lineWidth = 2 + Math.random() * 9;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.bezierCurveTo(x + 8, y + 40, x - 10, y + 90, x + 4, y + 60 + Math.random() * 110);
                ctx.stroke();
            }

            // Dried dust speckle
            for (let i = 0; i < 900; i++) {
                ctx.fillStyle = `rgba(${140 + Math.random() * 60 | 0}, ${120 + Math.random() * 50 | 0}, 90, ${Math.random() * .28})`;
                ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
            }

            ctx.globalCompositeOperation = 'destination-out';
        }

        function resetBay() {
            grid = new Uint8Array(COLS * ROWS);
            cleared = 0;
            water = 0;
            finished = false;
            last = null;
            bay.classList.remove('finished');
            canvas.style.transition = 'none';
            canvas.style.opacity = '1';
            paintDirt();
            updateProgress(true);
            unlock.classList.remove('unlocked');
            unlockBtn.disabled = true;
            unlockText.innerHTML = '<i class="ph ph-lock-simple"></i> Reward locked — finish the panel to unlock your Premium Shine booking.';
            hint.innerHTML = '<i class="ph ph-cursor-click"></i> Click and drag across the panel to start scrubbing.';
        }

        /* ---- Progress ---------------------------------------------------- */
        function markGrid(x, y, r) {
            const cw = w / COLS, ch = h / ROWS;
            const c0 = Math.max(0, Math.floor((x - r) / cw));
            const c1 = Math.min(COLS - 1, Math.floor((x + r) / cw));
            const r0 = Math.max(0, Math.floor((y - r) / ch));
            const r1 = Math.min(ROWS - 1, Math.floor((y + r) / ch));
            const rr = r * r;

            for (let row = r0; row <= r1; row++) {
                for (let col = c0; col <= c1; col++) {
                    const idx = row * COLS + col;
                    if (grid[idx]) continue;
                    const dx = (col + 0.5) * cw - x;
                    const dy = (row + 0.5) * ch - y;
                    if (dx * dx + dy * dy <= rr) {
                        grid[idx] = 1;
                        cleared++;
                    }
                }
            }
        }

        function updateProgress(silent) {
            const pct = Math.min(100, Math.round((cleared / grid.length) * 100));
            value.textContent = pct + '%';
            fill.style.width = pct + '%';
            track.setAttribute('aria-valuenow', pct);
            waterEl.textContent = water.toFixed(1) + ' L';

            if (silent) return;

            if (pct >= 30 && pct < 60) hint.innerHTML = '<i class="ph ph-hand-soap"></i> Good pace — the road film is lifting.';
            else if (pct >= 60 && pct < TARGET) hint.innerHTML = '<i class="ph ph-sparkle"></i> Almost there. Get the corners.';

            if (pct >= TARGET && !finished) finish();
        }

        function finish() {
            finished = true;
            scrubbing = false;
            bay.classList.remove('scrubbing');
            canvas.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1)';
            canvas.style.opacity = '0';
            bay.classList.add('finished');

            hint.innerHTML = '<i class="ph-fill ph-check-circle"></i> Panel cleared. That is the finish we hand back every time.';
            unlock.classList.add('unlocked');
            unlockBtn.disabled = false;
            unlockText.innerHTML = '<i class="ph-fill ph-lock-simple-open"></i> Unlocked — your demo Premium Shine slot is ready to claim.';
            toast('Panel spotless. Booking unlocked.', 'ph-fill ph-sparkle');
        }

        /* ---- Brushes ----------------------------------------------------- */
        function erase(x, y) {
            const r = tool.radius;
            if (tool.shape === 'wide') {
                ctx.save();
                ctx.filter = 'blur(6px)';
                ctx.fillStyle = 'rgba(0,0,0,1)';
                ctx.beginPath();
                const rw = r * 1.45, rh = r * 0.66;
                if (ctx.roundRect) ctx.roundRect(x - rw / 2, y - rh / 2, rw, rh, rh / 2);
                else ctx.rect(x - rw / 2, y - rh / 2, rw, rh);
                ctx.fill();
                ctx.restore();
            } else if (tool.shape === 'jet') {
                const g = ctx.createRadialGradient(x, y, 0, x, y, r);
                g.addColorStop(0, 'rgba(0,0,0,1)');
                g.addColorStop(0.65, 'rgba(0,0,0,0.9)');
                g.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
                // scattered droplets
                for (let i = 0; i < 5; i++) {
                    const a = Math.random() * Math.PI * 2;
                    const d = r + Math.random() * r * 1.6;
                    const dr = 3 + Math.random() * 7;
                    ctx.beginPath();
                    ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, dr, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                const g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
                g.addColorStop(0, 'rgba(0,0,0,1)');
                g.addColorStop(0.7, 'rgba(0,0,0,0.85)');
                g.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            markGrid(x, y, r * 0.82);
        }

        function strokeTo(x, y) {
            if (last) {
                const dist = Math.hypot(x - last.x, y - last.y);
                const steps = Math.ceil(dist / (tool.radius * 0.34));
                for (let i = 1; i <= steps; i++) {
                    erase(last.x + (x - last.x) * (i / steps), last.y + (y - last.y) * (i / steps));
                }
                water += dist * tool.flow * 0.012;
            } else {
                erase(x, y);
            }
            last = { x, y };
        }

        /* ---- Suds particles ---------------------------------------------- */
        let sudsBudget = 0;
        function spawnSuds(x, y) {
            if (reduceMotion) return;
            sudsBudget++;
            if (sudsBudget % 3 !== 0) return;
            for (let i = 0; i < tool.suds; i++) {
                const s = document.createElement('span');
                const size = 5 + Math.random() * 12;
                s.className = 'suds';
                s.style.width = s.style.height = size + 'px';
                s.style.left = (x - size / 2) + 'px';
                s.style.top = (y - size / 2) + 'px';
                s.style.opacity = 0.35 + Math.random() * 0.45;
                bay.appendChild(s);
                const dx = (Math.random() - 0.5) * 120;
                const dy = 40 + Math.random() * 110;
                const anim = s.animate(
                    [{ transform: 'translate(0,0) scale(1)', opacity: s.style.opacity },
                     { transform: `translate(${dx}px, ${dy}px) scale(.2)`, opacity: 0 }],
                    { duration: 700 + Math.random() * 700, easing: 'cubic-bezier(.16,1,.3,1)' }
                );
                anim.onfinish = () => s.remove();
            }
        }

        /* ---- Pointer wiring ---------------------------------------------- */
        const point = e => {
            const rect = bay.getBoundingClientRect();
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };

        bay.addEventListener('pointerenter', () => { if (!finished) bay.classList.add('active-tool'); });
        bay.addEventListener('pointerleave', () => {
            bay.classList.remove('active-tool', 'scrubbing');
            scrubbing = false;
            last = null;
        });

        bay.addEventListener('pointerdown', e => {
            if (finished || e.target.closest('.bay-reset') || e.target.closest('.bay-done')) return;
            bay.setPointerCapture(e.pointerId);
            scrubbing = true;
            bay.classList.add('scrubbing', 'active-tool');
            last = null;
            const p = point(e);
            strokeTo(p.x, p.y);
            spawnSuds(p.x, p.y);
            updateProgress();
        });

        bay.addEventListener('pointermove', e => {
            const p = point(e);
            cursor.style.left = p.x + 'px';
            cursor.style.top = p.y + 'px';
            if (!scrubbing || finished) return;
            e.preventDefault();
            strokeTo(p.x, p.y);
            spawnSuds(p.x, p.y);
            updateProgress();
        });

        const endStroke = () => {
            scrubbing = false;
            last = null;
            bay.classList.remove('scrubbing');
        };
        bay.addEventListener('pointerup', endStroke);
        bay.addEventListener('pointercancel', endStroke);

        // Tool switching
        $$('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                tool = TOOLS[btn.dataset.tool] || TOOLS.sponge;
                cursorIcon.className = tool.icon;
                const size = tool.radius * 1.8;
                cursor.style.width = cursor.style.height = size + 'px';
                cursor.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;
            });
        });

        $('#bay-reset').addEventListener('click', e => {
            e.stopPropagation();
            resetBay();
            toast('Fresh mud applied. Have another go.', 'ph-fill ph-arrow-counter-clockwise');
        });

        // Init + responsive redraw
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => { if (!finished) resetBay(); }, 250);
        });

        // Wait a frame so layout is settled before measuring
        requestAnimationFrame(() => { paintDirt(); updateProgress(true); });
    })();

    /* =======================================================================
       5. BEFORE / AFTER SLIDER
       ==================================================================== */
    (function beforeAfter() {
        const wrap = $('#ba-wrap');
        if (!wrap) return;
        const after = $('#ba-after');
        const handle = $('#ba-handle');
        let dragging = false;

        const setPos = pct => {
            const p = Math.max(0, Math.min(100, pct));
            after.style.clipPath = `inset(0 0 0 ${p}%)`;
            handle.style.left = p + '%';
            handle.setAttribute('aria-valuenow', Math.round(p));
        };

        const fromEvent = e => {
            const rect = wrap.getBoundingClientRect();
            return ((e.clientX - rect.left) / rect.width) * 100;
        };

        wrap.addEventListener('pointerdown', e => {
            dragging = true;
            wrap.setPointerCapture(e.pointerId);
            setPos(fromEvent(e));
        });
        wrap.addEventListener('pointermove', e => { if (dragging) setPos(fromEvent(e)); });
        wrap.addEventListener('pointerup', () => { dragging = false; });
        wrap.addEventListener('pointercancel', () => { dragging = false; });

        handle.addEventListener('keydown', e => {
            const now = parseFloat(handle.getAttribute('aria-valuenow'));
            if (e.key === 'ArrowLeft') { setPos(now - 4); e.preventDefault(); }
            if (e.key === 'ArrowRight') { setPos(now + 4); e.preventDefault(); }
        });

        setPos(50);
    })();

    /* =======================================================================
       6. BOOKING WIZARD (mock)
       ==================================================================== */
    const Booking = (function () {
        const modal = $('#booking-modal');
        if (!modal) return {};

        const VEHICLES = [
            { id: 'sedan',  name: 'Sedan / Coupe', meta: 'Up to 5 seats', surcharge: 0,  icon: 'ph-fill ph-car' },
            { id: 'suv',    name: 'SUV / Crossover', meta: 'Mid to large', surcharge: 8, icon: 'ph-fill ph-jeep' },
            { id: 'truck',  name: 'Truck / Van', meta: 'Pickup, panel van', surcharge: 14, icon: 'ph-fill ph-truck' },
            { id: 'luxury', name: 'Luxury / Sports', meta: 'Extra care protocol', surcharge: 20, icon: 'ph-fill ph-car-profile' }
        ];

        const CONDITIONS = [
            { id: 'light',  name: 'Light dust', extra: 0, minutes: 0 },
            { id: 'normal', name: 'Everyday grime', extra: 0, minutes: 5 },
            { id: 'heavy',  name: 'Heavy mud & salt', extra: 10, minutes: 20 }
        ];

        const PACKAGES = [
            {
                id: 'basic', name: 'Basic Wash', price: 15, minutes: 25,
                meta: 'Exterior hand wash',
                img: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=600&q=80'
            },
            {
                id: 'premium', name: 'Premium Shine', price: 35, minutes: 45,
                meta: 'Wash + interior + sealant',
                img: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80'
            },
            {
                id: 'detail', name: 'Full Detail', price: 85, minutes: 150,
                meta: 'The complete reset',
                img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80'
            },
            {
                id: 'member_premium', name: 'Premium Unlimited', price: 55, minutes: 45, monthly: true,
                meta: 'Unlimited Premium washes',
                img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80'
            },
            {
                id: 'member_basic', name: 'Basic Unlimited', price: 29, minutes: 25, monthly: true,
                meta: 'Unlimited Basic washes',
                img: 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?auto=format&fit=crop&w=600&q=80'
            }
        ];

        const ADDONS = [
            { id: 'ceramic',   name: 'Ceramic SiO₂ sealant', desc: '6 months of gloss and beading', price: 25, minutes: 15, icon: 'ph-fill ph-shield-check' },
            { id: 'steam',     name: 'Interior steam clean', desc: 'Sanitised vents, trim and seats', price: 22, minutes: 25, icon: 'ph-fill ph-thermometer-hot' },
            { id: 'pethair',   name: 'Pet hair removal',     desc: 'Rubber-blade extraction, boot included', price: 18, minutes: 20, icon: 'ph-fill ph-paw-print' },
            { id: 'headlight', name: 'Headlight restoration', desc: 'Wet-sand and UV clear re-seal', price: 20, minutes: 25, icon: 'ph-fill ph-lightbulb-filament' },
            { id: 'engine',    name: 'Engine bay degrease',  desc: 'Dressed and photographed after', price: 15, minutes: 20, icon: 'ph-fill ph-engine' },
            { id: 'odour',     name: 'Ozone odour treatment', desc: 'Smoke, damp and gym-bag neutraliser', price: 12, minutes: 15, icon: 'ph-fill ph-wind' }
        ];

        const LOCATIONS = ['Downtown Flagship', 'Westside Express', 'Uptown Detail Studio'];
        const TIMES = ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30', '17:00'];

        const state = {
            step: 1,
            vehicle: 'sedan',
            condition: 'normal',
            pkg: 'premium',
            addons: new Set(),
            location: LOCATIONS[0],
            date: null,
            time: null,
            ref: null
        };

        const LAST_STEP = 6;
        const stepper = $('#stepper');
        const backBtn = $('#bk-back');
        const nextBtn = $('#bk-next');

        /* ---- Deterministic "availability" -------------------------------- */
        const hash = str => {
            let h = 0;
            for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
            return Math.abs(h);
        };
        const slotFull = (dateKey, time) => hash(dateKey + time + state.location) % 5 === 0;

        const dayList = () => {
            const days = [];
            const now = new Date();
            for (let i = 0; i < 7; i++) {
                const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
                days.push({
                    key: d.toISOString().slice(0, 10),
                    label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString(undefined, { weekday: 'short' }),
                    sub: d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
                    date: d
                });
            }
            return days;
        };
        const DAYS = dayList();

        /* ---- Lookups ------------------------------------------------------ */
        const getPkg = () => PACKAGES.find(p => p.id === state.pkg);
        const getVehicle = () => VEHICLES.find(v => v.id === state.vehicle);
        const getCondition = () => CONDITIONS.find(c => c.id === state.condition);

        function totals() {
            const pkg = getPkg();
            const vehicle = getVehicle();
            const condition = getCondition();
            const addons = ADDONS.filter(a => state.addons.has(a.id));

            const addonSum = addons.reduce((s, a) => s + a.price, 0);
            const sizeSum = pkg.monthly ? 0 : vehicle.surcharge;
            const condSum = pkg.monthly ? 0 : condition.extra;

            const minutes = pkg.minutes + condition.minutes + addons.reduce((s, a) => s + a.minutes, 0);
            return {
                pkg, vehicle, condition, addons, addonSum, sizeSum, condSum,
                total: pkg.price + sizeSum + condSum + addonSum,
                minutes
            };
        }

        const fmtDuration = mins => {
            const h = Math.floor(mins / 60), m = mins % 60;
            return h ? `${h}h${m ? ' ' + m + 'm' : ''}` : `${m} min`;
        };

        /* ---- Renderers ---------------------------------------------------- */
        function renderVehicles() {
            $('#vehicle-grid').innerHTML = VEHICLES.map(v => `
                <button type="button" class="opt ${state.vehicle === v.id ? 'selected' : ''}" data-vehicle="${v.id}">
                    <span class="opt-check"><i class="ph-bold ph-check"></i></span>
                    <div class="opt-icon"><i class="${v.icon}"></i></div>
                    <div class="opt-body">
                        <div class="opt-name">${v.name}</div>
                        <div class="opt-meta">${v.meta}</div>
                        <div class="opt-price">${v.surcharge ? '+' + money(v.surcharge) : 'No surcharge'}</div>
                    </div>
                </button>`).join('');
        }

        function renderConditions() {
            $('#condition-row').innerHTML = CONDITIONS.map(c => `
                <button type="button" class="chip ${state.condition === c.id ? 'selected' : ''}" data-condition="${c.id}">
                    ${c.name}<small>${c.extra ? '+' + money(c.extra) : 'included'}</small>
                </button>`).join('');
        }

        function renderPackages() {
            $('#package-grid').innerHTML = PACKAGES.map(p => `
                <button type="button" class="opt ${state.pkg === p.id ? 'selected' : ''}" data-package="${p.id}">
                    <span class="opt-check"><i class="ph-bold ph-check"></i></span>
                    <div class="opt-media media">
                        <img src="${p.img}" alt="" onerror="this.remove()">
                    </div>
                    <div class="opt-body">
                        <div class="opt-name">${p.name}</div>
                        <div class="opt-meta">${p.meta}</div>
                        <div class="opt-price">${money(p.price)}${p.monthly ? ' / month' : ''} · ${fmtDuration(p.minutes)}</div>
                    </div>
                </button>`).join('');
        }

        function renderAddons() {
            $('#addon-list').innerHTML = ADDONS.map(a => `
                <button type="button" class="addon ${state.addons.has(a.id) ? 'selected' : ''}" data-addon="${a.id}">
                    <span class="box"><i class="ph-bold ph-check"></i></span>
                    <i class="${a.icon} addon-ico"></i>
                    <span class="addon-txt">
                        <strong>${a.name}</strong>
                        <small>${a.desc} · +${fmtDuration(a.minutes)}</small>
                    </span>
                    <span class="addon-price">+${money(a.price)}</span>
                </button>`).join('');
        }

        function renderSlots() {
            $('#location-row').innerHTML = LOCATIONS.map(l => `
                <button type="button" class="chip ${state.location === l ? 'selected' : ''}" data-location="${l}">${l}</button>`).join('');

            $('#date-row').innerHTML = DAYS.map(d => `
                <button type="button" class="chip ${state.date === d.key ? 'selected' : ''}" data-date="${d.key}">
                    ${d.label}<small>${d.sub}</small>
                </button>`).join('');

            const dateKey = state.date || DAYS[0].key;
            $('#time-row').innerHTML = TIMES.map(t => {
                const full = slotFull(dateKey, t);
                return `<button type="button" class="chip ${state.time === t ? 'selected' : ''}" data-time="${t}" ${full ? 'disabled title="Fully booked"' : ''}>
                    ${t}<small>${full ? 'Full' : 'Available'}</small>
                </button>`;
            }).join('');
        }

        function renderSummary() {
            const t = totals();
            const day = DAYS.find(d => d.key === state.date);
            const media = $('#summary-media');
            const img = media.querySelector('img');
            if (img) img.src = t.pkg.img;

            const rows = [
                ['Package', t.pkg.name + (t.pkg.monthly ? ' (monthly)' : '')],
                ['Vehicle', t.vehicle.name + (t.sizeSum ? ` (+${money(t.sizeSum)})` : '')],
                ['Condition', t.condition.name + (t.condSum ? ` (+${money(t.condSum)})` : '')],
                ['Location', state.location],
                ['Slot', day && state.time ? `${day.label}, ${state.time}` : 'Not chosen yet']
            ];

            let html = rows.map(([k, v]) => `<div class="row"><span>${k}</span><span>${v}</span></div>`).join('');

            if (t.addons.length) {
                html += `<div class="row"><span>Add-ons</span><span>${t.addons.length} selected</span></div>`;
                html += t.addons.map(a => `<div class="row muted"><span>· ${a.name}</span><span>+${money(a.price)}</span></div>`).join('');
            } else {
                html += `<div class="row"><span>Add-ons</span><span>None</span></div>`;
            }

            $('#summary-lines').innerHTML = html;
            $('#summary-total').textContent = money(t.total) + (t.pkg.monthly ? '' : '');
            $('#summary-duration').textContent = fmtDuration(t.minutes);
        }

        function renderStepper() {
            let html = '';
            for (let i = 1; i <= 5; i++) {
                const cls = state.step > i || state.step === LAST_STEP ? 'done' : state.step === i ? 'current' : '';
                html += `<span class="dot ${cls}">${state.step > i || state.step === LAST_STEP ? '&check;' : i}</span>`;
                if (i < 5) html += '<span class="bar"></span>';
            }
            stepper.innerHTML = html;
        }

        /* ---- Navigation ---------------------------------------------------- */
        function showStep(n) {
            state.step = n;
            $$('.step-pane').forEach(p => p.classList.toggle('active', +p.dataset.step === n));
            renderStepper();

            backBtn.style.visibility = n === 1 || n === LAST_STEP ? 'hidden' : 'visible';
            nextBtn.innerHTML = n === 5
                ? '<i class="ph-fill ph-check-circle"></i> Confirm booking'
                : n === LAST_STEP
                    ? '<i class="ph ph-house"></i> Done'
                    : 'Continue <i class="ph-bold ph-arrow-right"></i>';

            // The summary column is dropped on the confirmation step — collapse the
            // grid track too, otherwise it leaves a 320px gap.
            const onConfirm = n === LAST_STEP;
            $('#modal-aside').style.display = onConfirm ? 'none' : '';
            $('.modal-body').style.gridTemplateColumns = onConfirm ? '1fr' : '';
            $('#modal-main').scrollTop = 0;
            renderSummary();
        }

        function validateDetails() {
            const checks = [
                { el: $('#bk-name'), ok: v => v.trim().length > 1 },
                { el: $('#bk-phone'), ok: v => /^[0-9]{10}$/.test(v.replace(/\D/g, '')) },
                { el: $('#bk-email'), ok: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) }
            ];
            let valid = true;
            checks.forEach(({ el, ok }) => {
                const group = el.closest('.form-group');
                const good = ok(el.value);
                group.classList.toggle('invalid', !good);
                group.classList.toggle('valid', good);
                if (!good) valid = false;
            });
            return valid;
        }

        function makeRef() {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let out = '';
            for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
            return 'MW-' + out;
        }

        function confirmBooking() {
            const t = totals();
            const day = DAYS.find(d => d.key === state.date);
            state.ref = makeRef();
            $('#confirm-ref').textContent = state.ref;

            const rows = [
                ['Name', $('#bk-name').value.trim()],
                ['Package', t.pkg.name],
                ['Vehicle', t.vehicle.name + ($('#bk-plate').value.trim() ? ' · ' + $('#bk-plate').value.trim().toUpperCase() : '')],
                ['Add-ons', t.addons.length ? t.addons.map(a => a.name).join(', ') : 'None'],
                ['Where', state.location],
                ['When', `${day ? day.label + ' ' + day.sub : ''} at ${state.time}`],
                ['Duration', fmtDuration(t.minutes)],
                ['Total', money(t.total) + (t.pkg.monthly ? ' / month' : ' at the bay')]
            ];

            $('#confirm-card').innerHTML = `<div class="summary-lines">${
                rows.map(([k, v]) => `<div class="row"><span>${k}</span><span>${v || '—'}</span></div>`).join('')
            }</div>`;

            showStep(LAST_STEP);
            toast('Booking confirmed — reference ' + state.ref, 'ph-fill ph-seal-check');
        }

        /* ---- Open / close --------------------------------------------------- */
        let lastFocused = null;

        function open(opts = {}) {
            if (opts.package && PACKAGES.some(p => p.id === opts.package)) state.pkg = opts.package;
            if (opts.location && LOCATIONS.includes(opts.location)) state.location = opts.location;
            if (opts.time && TIMES.includes(opts.time)) state.time = opts.time;
            if (!state.date) state.date = DAYS[0].key;
            if (!state.time) state.time = TIMES.find(t => !slotFull(state.date, t)) || TIMES[0];

            lastFocused = document.activeElement;
            renderVehicles(); renderConditions(); renderPackages(); renderAddons(); renderSlots();
            showStep(opts.step || 1);
            modal.classList.add('open');
            lockScroll(true);
            setTimeout(() => nextBtn.focus(), 320);
        }

        function close() {
            modal.classList.remove('open');
            lockScroll(false);
            if (lastFocused) lastFocused.focus();
            // Reset for the next run once the fade-out has finished
            setTimeout(() => {
                if (modal.classList.contains('open')) return;
                state.addons.clear();
                state.step = 1;
                showStep(1);
            }, 400);
        }

        /* ---- Events ---------------------------------------------------------- */
        $$('[data-close-booking]').forEach(el => el.addEventListener('click', close));

        document.addEventListener('click', e => {
            const trigger = e.target.closest('[data-open-booking]');
            if (!trigger) return;
            e.preventDefault();
            open({ package: trigger.dataset.package });
        });

        // Option delegation
        $('#modal-main').addEventListener('click', e => {
            const vehicle = e.target.closest('[data-vehicle]');
            const condition = e.target.closest('[data-condition]');
            const pkg = e.target.closest('[data-package]');
            const addon = e.target.closest('[data-addon]');
            const location = e.target.closest('[data-location]');
            const date = e.target.closest('[data-date]');
            const time = e.target.closest('[data-time]');

            if (vehicle) { state.vehicle = vehicle.dataset.vehicle; renderVehicles(); }
            else if (condition) { state.condition = condition.dataset.condition; renderConditions(); }
            else if (pkg) { state.pkg = pkg.dataset.package; renderPackages(); }
            else if (addon) {
                const id = addon.dataset.addon;
                state.addons.has(id) ? state.addons.delete(id) : state.addons.add(id);
                renderAddons();
            }
            else if (location) { state.location = location.dataset.location; renderSlots(); }
            else if (date) { state.date = date.dataset.date; renderSlots(); }
            else if (time && !time.disabled) { state.time = time.dataset.time; renderSlots(); }
            else return;

            renderSummary();
        });

        nextBtn.addEventListener('click', () => {
            if (state.step === LAST_STEP) { close(); return; }
            if (state.step === 4 && (!state.date || !state.time)) {
                toast('Pick a date and time to continue.', 'ph-fill ph-warning-circle');
                return;
            }
            if (state.step === 5) {
                if (!validateDetails()) {
                    toast('Check the highlighted fields.', 'ph-fill ph-warning-circle');
                    return;
                }
                confirmBooking();
                return;
            }
            showStep(state.step + 1);
        });

        backBtn.addEventListener('click', () => showStep(Math.max(1, state.step - 1)));

        document.addEventListener('keydown', e => {
            if (e.key !== 'Escape') return;
            if (modal.classList.contains('open')) close();
            else if ($('#lightbox').classList.contains('open')) $('#lightbox-close').click();
            else if (drawer.classList.contains('open')) closeDrawer();
        });

        // Clear validation state as the user types
        ['#bk-name', '#bk-phone', '#bk-email'].forEach(sel => {
            const el = $(sel);
            el && el.addEventListener('input', () => el.closest('.form-group').classList.remove('invalid'));
        });

        return { open, close, LOCATIONS, TIMES };
    })();

    // Hero express-booking form hands off to the wizard
    const quickForm = $('#quick-book-form');
    if (quickForm) {
        quickForm.addEventListener('submit', e => {
            e.preventDefault();
            Booking.open && Booking.open({
                location: $('#quick-location').value || undefined,
                time: $('#quick-time').value || undefined,
                step: 1
            });
        });
    }

    /* =======================================================================
       7. CONTACT FORM
       ==================================================================== */
    const contactForm = $('#contact-form');
    if (contactForm) {
        const formMessage = $('#form-message');

        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            let valid = true;

            $$('.form-group', contactForm).forEach(group => {
                const input = group.querySelector('input, select, textarea');
                if (!input || !input.hasAttribute('required')) return;
                group.classList.remove('invalid', 'valid');

                const value = input.value.trim();
                let ok = value.length > 0;

                if (ok && input.type === 'tel') ok = /^[0-9]{10}$/.test(value.replace(/\D/g, ''));
                if (ok && input.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

                group.classList.add(ok ? 'valid' : 'invalid');
                if (!ok) valid = false;
            });

            if (!valid) {
                toast('Please fix the highlighted fields.', 'ph-fill ph-warning-circle');
                return;
            }

            formMessage.textContent = 'Thanks — a wash advisor will call you back within the hour.';
            formMessage.className = 'form-message success';
            contactForm.reset();
            $$('.form-group', contactForm).forEach(g => g.classList.remove('valid'));
            toast('Callback request received.');

            setTimeout(() => { formMessage.className = 'form-message'; }, 6000);
        });

        $$('input, select, textarea', contactForm).forEach(input => {
            input.addEventListener('input', () => input.closest('.form-group').classList.remove('invalid'));
        });
    }
});
