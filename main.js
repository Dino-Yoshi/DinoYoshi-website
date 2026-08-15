// main.js
// This file contains the typing animation logic for the DinoYoshi website.
// It also contains the logic for the project carousel, modal, and contact form.
// Linked from index.html.


// Typing animation logic
const typingText = "Darien Chau";
const typedElement = document.getElementById("typed");
const typingSpeed = 120; // Speed in milliseconds

let charIndex = 0;

function type() {
  if (charIndex <= typingText.length) {
    typedElement.textContent = typingText.slice(0, charIndex);
    charIndex++;
    setTimeout(type, typingSpeed);
  }
}

type();

// Animated constellation canvas background
function initConstellationBackground() {
    try {
        const canvas = document.getElementById('constellation-background');
        if (!canvas || typeof canvas.getContext !== 'function') return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const hasAnimationFrame = typeof window.requestAnimationFrame === 'function';
        const canCancelAnimationFrame = typeof window.cancelAnimationFrame === 'function';
        const motionQuery = typeof window.matchMedia === 'function'
            ? window.matchMedia('(prefers-reduced-motion: reduce)')
            : null;

        const CONSTELLATION_LINE_INTERVAL = 380;
        const AMBIENT_PULSE_INTERVAL = 450;
        const PULSE_DURATION = 1000;
        const GLOW_DURATION = 1600;
        const ROTATION_RADIANS_PER_MS = (0.0006 * 60) / 1000;
        const LINE_OPACITY = 0.22;
        const DPR_CAP = 2;

        const colorFallbacks = {
            accent: '#35c2b5',
            accentStrong: '#58d9cd'
        };

        const constellations = [
            {
                name: 'Ursa Major',
                origin: { x: 0.18, y: 0.23 },
                scale: 0.25,
                rotation: -0.25,
                stars: [
                    [0.10, 0.52], [0.24, 0.38], [0.42, 0.32], [0.56, 0.42],
                    [0.68, 0.58], [0.84, 0.62], [0.96, 0.48]
                ],
                lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]
            },
            {
                name: 'Orion',
                origin: { x: 0.68, y: 0.28 },
                scale: 0.29,
                rotation: 0.18,
                stars: [
                    [0.24, 0.08], [0.74, 0.12], [0.38, 0.42], [0.52, 0.46],
                    [0.66, 0.50], [0.20, 0.90], [0.76, 0.88]
                ],
                lines: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [0, 1], [5, 6]]
            },
            {
                name: 'Cassiopeia',
                origin: { x: 0.40, y: 0.18 },
                scale: 0.20,
                rotation: 0.06,
                stars: [
                    [0.05, 0.25], [0.28, 0.68], [0.50, 0.18], [0.72, 0.62], [0.95, 0.30]
                ],
                lines: [[0, 1], [1, 2], [2, 3], [3, 4]]
            },
            {
                name: 'Cygnus',
                origin: { x: 0.30, y: 0.68 },
                scale: 0.27,
                rotation: -0.08,
                stars: [
                    [0.50, 0.02], [0.50, 0.24], [0.50, 0.48], [0.50, 0.72],
                    [0.50, 0.96], [0.18, 0.46], [0.82, 0.48]
                ],
                lines: [[0, 1], [1, 2], [2, 3], [3, 4], [5, 2], [2, 6]]
            },
            {
                name: 'Lyra',
                origin: { x: 0.75, y: 0.72 },
                scale: 0.18,
                rotation: 0.28,
                stars: [
                    [0.10, 0.02], [0.38, 0.42], [0.72, 0.36], [0.90, 0.70], [0.52, 0.78]
                ],
                lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1]]
            }
        ];

        let width = 0;
        let height = 0;
        let minSide = 0;
        let backdropStars = [];
        let ambientStars = [];
        let constellationPulses = [];
        let ambientPulses = [];
        let starGlows = new Map();
        let animationFrame = null;
        let startTime = 0;
        let lastTime = 0;
        let lastConstellationPulse = 0;
        let lastAmbientPulse = 0;

        function cssColor(name, fallback) {
            const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
            return value || fallback;
        }

        function withAlpha(color, alpha) {
            if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
                const hex = color.length === 4
                    ? color.slice(1).split('').map((digit) => digit + digit).join('')
                    : color.slice(1);
                const red = parseInt(hex.slice(0, 2), 16);
                const green = parseInt(hex.slice(2, 4), 16);
                const blue = parseInt(hex.slice(4, 6), 16);
                return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            }
            return color;
        }

        function randomBetween(min, max) {
            return min + Math.random() * (max - min);
        }

        function resizeCanvas() {
            width = window.innerWidth || document.documentElement.clientWidth || 1;
            height = window.innerHeight || document.documentElement.clientHeight || 1;
            minSide = Math.max(1, Math.min(width, height));

            const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
            canvas.width = Math.max(1, Math.round(width * dpr));
            canvas.height = Math.max(1, Math.round(height * dpr));
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const area = width * height;
            const backdropCount = Math.max(24, Math.round(area / 12000));
            const ambientCount = Math.max(8, Math.round(area / 20000));

            backdropStars = Array.from({ length: backdropCount }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: randomBetween(0.45, 1.15),
                opacity: randomBetween(0.14, 0.42),
                phase: randomBetween(0, Math.PI * 2),
                speed: randomBetween(0.0006, 0.0014)
            }));

            ambientStars = Array.from({ length: ambientCount }, () => {
                const angle = Math.random() * Math.PI * 2;
                const speed = randomBetween(0.035, 0.075);
                return {
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    radius: randomBetween(1, 1.8)
                };
            });

            constellationPulses = [];
            ambientPulses = [];
            starGlows = new Map();
        }

        function rotatePoint(x, y, centerX, centerY, angle) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const dx = x - centerX;
            const dy = y - centerY;
            return {
                x: centerX + dx * cos - dy * sin,
                y: centerY + dx * sin + dy * cos
            };
        }

        function constellationPositions(rotationAngle) {
            const centerX = width / 2;
            const centerY = height / 2;

            return constellations.map((constellation) => {
                const size = minSide * constellation.scale;
                const localCenterX = constellation.origin.x * width;
                const localCenterY = constellation.origin.y * height;
                const localCos = Math.cos(constellation.rotation);
                const localSin = Math.sin(constellation.rotation);
                const stars = constellation.stars.map(([x, y], index) => {
                    const localX = (x - 0.5) * size;
                    const localY = (y - 0.5) * size;
                    return {
                        index,
                        x: localCenterX + localX * localCos - localY * localSin,
                        y: localCenterY + localX * localSin + localY * localCos
                    };
                }).map((star) => ({
                    ...star,
                    ...rotatePoint(star.x, star.y, centerX, centerY, rotationAngle)
                }));

                return { ...constellation, stars };
            });
        }

        function allNamedStars(positionedConstellations) {
            return positionedConstellations.flatMap((constellation, constellationIndex) =>
                constellation.stars.map((star) => ({ ...star, constellationIndex }))
            );
        }

        function drawCircle(x, y, radius, fillStyle) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = fillStyle;
            ctx.fill();
        }

        function drawLine(from, to, strokeStyle, lineWidth) {
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }

        function spawnConstellationPulse(now) {
            const constellationIndex = Math.floor(Math.random() * constellations.length);
            const constellation = constellations[constellationIndex];
            const lineIndex = Math.floor(Math.random() * constellation.lines.length);
            constellationPulses.push({ constellationIndex, lineIndex, start: now });
        }

        function spawnAmbientPulse(now, positionedConstellations) {
            if (!ambientStars.length) return;
            const namedStars = allNamedStars(positionedConstellations);
            if (!namedStars.length) return;
            ambientPulses.push({
                ambientIndex: Math.floor(Math.random() * ambientStars.length),
                star: namedStars[Math.floor(Math.random() * namedStars.length)],
                start: now
            });
        }

        function drawBackdrop(now) {
            backdropStars.forEach((star) => {
                const twinkle = Math.sin(now * star.speed + star.phase) * 0.10;
                drawCircle(star.x, star.y, star.radius, `rgba(234, 240, 250, ${Math.max(0.06, star.opacity + twinkle)})`);
            });
        }

        function drawProximityLinks(namedStars, accent) {
            const threshold = minSide * 0.14;
            const nodes = ambientStars.concat(namedStars.map((star) => ({
                x: star.x,
                y: star.y,
                radius: 1.4,
                named: true
            })));

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    if (nodes[i].named && nodes[j].named) continue;
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const distance = Math.hypot(dx, dy);
                    if (distance > threshold) continue;
                    const opacity = (1 - distance / threshold) * 0.18;
                    drawLine(nodes[i], nodes[j], withAlpha(accent, opacity), 0.7);
                }
            }
        }

        function updateAmbientStars(delta, reducedMotion) {
            if (reducedMotion) return;
            ambientStars.forEach((star) => {
                star.x += star.vx * delta;
                star.y += star.vy * delta;

                if (star.x < 0 || star.x > width) {
                    star.vx *= -1;
                    star.x = Math.max(0, Math.min(width, star.x));
                }
                if (star.y < 0 || star.y > height) {
                    star.vy *= -1;
                    star.y = Math.max(0, Math.min(height, star.y));
                }
            });
        }

        function drawConstellations(positionedConstellations, now, accent, accentStrong) {
            positionedConstellations.forEach((constellation, constellationIndex) => {
                constellation.lines.forEach(([fromIndex, toIndex]) => {
                    drawLine(
                        constellation.stars[fromIndex],
                        constellation.stars[toIndex],
                        withAlpha(accent, LINE_OPACITY),
                        0.85
                    );
                });

                constellation.stars.forEach((star) => {
                    const glowKey = `${constellationIndex}:${star.index}`;
                    const glowStart = starGlows.get(glowKey);
                    const glowProgress = glowStart ? Math.min(1, (now - glowStart) / GLOW_DURATION) : 1;
                    const glow = glowStart ? (1 - glowProgress) : 0;
                    if (glowStart && glowProgress >= 1) starGlows.delete(glowKey);

                    if (glow > 0) {
                        drawCircle(star.x, star.y, 7 * glow + 2, withAlpha(accentStrong, 0.18 * glow));
                    }
                    drawCircle(star.x, star.y, 1.7 + glow * 0.7, withAlpha(accentStrong, 0.58 + glow * 0.38));
                });
            });
        }

        function drawPulses(positionedConstellations, now, accentStrong) {
            constellationPulses = constellationPulses.filter((pulse) => {
                const progress = (now - pulse.start) / PULSE_DURATION;
                if (progress >= 1) {
                    const line = constellations[pulse.constellationIndex].lines[pulse.lineIndex];
                    starGlows.set(`${pulse.constellationIndex}:${line[1]}`, now);
                    return false;
                }
                if (progress < 0) return true;

                const line = positionedConstellations[pulse.constellationIndex].lines[pulse.lineIndex];
                const from = positionedConstellations[pulse.constellationIndex].stars[line[0]];
                const to = positionedConstellations[pulse.constellationIndex].stars[line[1]];
                drawCircle(
                    from.x + (to.x - from.x) * progress,
                    from.y + (to.y - from.y) * progress,
                    2.4,
                    withAlpha(accentStrong, 0.85)
                );
                return true;
            });

            ambientPulses = ambientPulses.filter((pulse) => {
                const progress = (now - pulse.start) / PULSE_DURATION;
                if (progress >= 1) {
                    starGlows.set(`${pulse.star.constellationIndex}:${pulse.star.index}`, now);
                    return false;
                }
                if (progress < 0 || !ambientStars[pulse.ambientIndex]) return progress < 1;

                const target = positionedConstellations[pulse.star.constellationIndex].stars[pulse.star.index];
                const source = ambientStars[pulse.ambientIndex];
                drawCircle(
                    source.x + (target.x - source.x) * progress,
                    source.y + (target.y - source.y) * progress,
                    2,
                    withAlpha(accentStrong, 0.72)
                );
                return true;
            });
        }

        function render(now, reducedMotion) {
            const elapsed = reducedMotion ? 0 : now - startTime;
            const rotationAngle = elapsed * ROTATION_RADIANS_PER_MS;
            const accent = cssColor('--accent', colorFallbacks.accent);
            const accentStrong = cssColor('--accent-strong', colorFallbacks.accentStrong);
            const positionedConstellations = constellationPositions(rotationAngle);
            const namedStars = allNamedStars(positionedConstellations);

            ctx.clearRect(0, 0, width, height);
            drawBackdrop(now);
            drawProximityLinks(namedStars, accent);
            ambientStars.forEach((star) => drawCircle(star.x, star.y, star.radius, withAlpha(accent, 0.50)));
            drawConstellations(positionedConstellations, now, accent, accentStrong);
            drawPulses(positionedConstellations, now, accentStrong);
        }

        function frame(now) {
            const reducedMotion = Boolean(motionQuery?.matches);
            const delta = lastTime ? Math.min(48, now - lastTime) : 16;
            lastTime = now;

            updateAmbientStars(delta, reducedMotion);

            if (!reducedMotion) {
                if (now - lastConstellationPulse >= CONSTELLATION_LINE_INTERVAL) {
                    spawnConstellationPulse(now);
                    lastConstellationPulse = now;
                }
                const positionedConstellations = constellationPositions((now - startTime) * ROTATION_RADIANS_PER_MS);
                if (now - lastAmbientPulse >= AMBIENT_PULSE_INTERVAL) {
                    spawnAmbientPulse(now, positionedConstellations);
                    lastAmbientPulse = now;
                }
            }

            render(now, reducedMotion);
            if (!reducedMotion && hasAnimationFrame) {
                animationFrame = window.requestAnimationFrame(frame);
            }
        }

        function stopLoop() {
            if (animationFrame !== null && canCancelAnimationFrame) {
                window.cancelAnimationFrame(animationFrame);
            }
            animationFrame = null;
        }

        function start() {
            stopLoop();
            resizeCanvas();
            startTime = performance.now();
            lastTime = 0;
            lastConstellationPulse = startTime;
            lastAmbientPulse = startTime;

            if (motionQuery?.matches || !hasAnimationFrame) {
                render(0, true);
                return;
            }

            animationFrame = window.requestAnimationFrame(frame);
        }

        window.addEventListener('resize', start);

        if (motionQuery) {
            const handleMotionChange = () => {
                stopLoop();
                constellationPulses = [];
                ambientPulses = [];
                starGlows = new Map();
                if (motionQuery.matches) {
                    render(0, true);
                } else {
                    start();
                }
            };

            if (typeof motionQuery.addEventListener === 'function') {
                motionQuery.addEventListener('change', handleMotionChange);
            } else if (typeof motionQuery.addListener === 'function') {
                motionQuery.addListener(handleMotionChange);
            }
        }

        start();
    } catch (error) {
        console.warn('Constellation background could not be initialized.', error);
    }
}

// Carousel, modal, nav, and contact form logic
document.addEventListener('DOMContentLoaded', () => {
    initConstellationBackground();

    // --- Site Nav --- //
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    const navLinkEls = Array.from(document.querySelectorAll('#nav-links a'));

    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinkEls.forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    const navSections = navLinkEls
        .map((link) => document.getElementById(link.dataset.nav))
        .filter(Boolean);

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinkEls.forEach((link) => {
                link.classList.toggle('active', link.dataset.nav === entry.target.id);
            });
        });
    }, { rootMargin: '-45% 0px -45% 0px' });

    navSections.forEach((section) => sectionObserver.observe(section));

    // --- Footer year --- //
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // --- Project Carousel & Modal --- //

    // 1. Initialization
    const carousel = document.querySelector('.projects-carousel');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const modal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const closeButton = document.querySelector('.close-button');

    const PROJECTS_PER_PAGE = 6;
    const PLACEHOLDER_DESCRIPTION = 'Project details coming soon — check back for a full write-up of this build.';

    let isTransitioning = false;
    let currentPage = 0;

    const projectDetails = [
        { title: 'Catenna', modalTitle: 'Catenna', link: 'https://github.com/Dino-Yoshi/Catenna', description: 'In July 2026, I began developing Catenna after finding that using coding agents by themselves was inconsistent, expensive, and often introduced technical debt over repeated development cycles. Catenna is my solution to that problem: a deterministic 9-stage pipeline that coordinates Codex and Claude through specification, implementation, testing, review, and a final decision. Rather than relying on one agent to handle everything, I use each stage to narrow requirements and catch problems before they make it further into development. Across roughly 45 tasks I have run through Catenna, 39 met their requirements, passed testing, and avoided identified technical debt.', image: './images/catennaPlaceholder.svg', imageAlt: 'Catenna placeholder icon' },
        { title: 'Immersive Enchanting', modalTitle: 'Immersive Enchanting', link: 'https://github.com/Dino-Yoshi/ImmersiveEnchantingBackport-1.12.2', description: 'Starting in June 2026, I began developing Immersive Enchanting Backport, a Minecraft Forge 1.12.2 recreation of a modern enchanting mod that I had originally played with friends. I wanted to replace the usual luck-based enchanting system with something that had more meaningful progression through knowledges and materials. Over development, I implemented systems involving custom interfaces, configurable recipes, Ancient Books, and compatibility with other mods. The project grew much larger than I initially expected, but I eventually pulled the scope back in and released a working version on CurseForge with permission from the original developers.', image: './images/immersiveEnchantingForkIcon.png', imageAlt: 'Immersive Enchanting fork icon' },
        { title: 'Minecraft Mod Development', modalTitle: 'Minecraft Mod Development', link: 'https://github.com/Dino-Yoshi/ChickenTears', description: 'Throughout 2026, I began working more seriously with Minecraft Forge 1.12.2, mostly creating or modifying things that I personally wanted while playing older modpacks. Outside of Immersive Enchanting, I have worked on smaller projects such as ChickenTears, a lightweight backport of two modern music discs, and SRPOverLastFork, where I worked with an existing older mod and focused on narrowing and improving its functionality. These projects have given me experience working around older APIs, inherited code, compatibility problems, and the limitations that come with developing for a version of Minecraft that is now several years old.', image: './images/forgeIcon.png', imageAlt: 'Minecraft Forge icon' },
        { title: 'SI Leader - California State University, East Bay', modalTitle: 'SI Leader', link: 'https://www.csueastbay.edu/scaa/', description: 'Beginning in Fall 2026, I began serving as a Supplemental Instruction Leader for CS 101, Programming in Python, at California State University, East Bay. I currently support a group of 21 students by designing and leading weekly 90-minute sessions centered around active learning rather than simply giving students answers. I build brief lesson plans around difficult course material, guide students through programming and debugging problems, and encourage them to think through problems independently. Mainly, my role is to help bridge the gap between what is taught during lecture and what students may still struggle to understand afterward.', image: './images/scaaIcon.png', imageAlt: 'SCAA icon' },
        { title: 'Reinforcement Learning - BattleBoxAI', modalTitle: 'BattleBoxAI', link: 'https://github.com/Dino-Yoshi/PPO-RL-Model', description: 'In the month of January 2026, I designed BattleBoxAI, a reinforcement learning project that was tasked with creating an agent that was capable of taking input (bullet positions) and outputting actions (movement). Through existing technologies and tools, specifically Stable-Baselines3 and TensorBoard, I refined my model through PPO, or Proximal Policy Optimization. The end result was an average score of 476 out of 1000 based on survival duration over the course of 10 episodes.', image: './images/battleboxai.jpg', imageAlt: 'BattleBoxAI' },
        { title: 'Machine Learning - DogCheck', modalTitle: 'DogCheck', link: 'https://colab.research.google.com/drive/181N1rNfrWUJV3g9JaynXLc1GGnDk0kI_?usp=sharing', description: 'Between November and December 2025, I developed DogCheck, a machine learning project aimed at identifying dog groups or roles from a rigorously labeled dataset comprised of over 250+ breeds. Utilizing fundamental libraries such as Pandas and NumPy for data handling alongside scikit-learn for model development, I trained a gradient boosting classifier (XGBClassifier) that achieved an accuracy of 79% on unseen data. Mainly, most of my time was spent on data preprocessing and feature engineering more than anything else.', image: './images/dogCheck.jpg', imageAlt: 'DogCheck'},
        { title: 'MESA U HACKS 2025 - 2nd Best Pitch', modalTitle: 'MESA U HACKS 2.0', link: 'https://github.com/Jdeww/Mesa-U-Hacks-2.0', description: 'At MESA U Hacks 2.0 in September 2025, I participated on a team building a study tool called NimbusNotes. I developed the backend and API in Python/FastAPI, integrating AWS services and the model with the front end. The app accepted file and image uploads; GPT-4.1 Mini converted the content into flashcards and quizzes for solo review or group competition. Our team won the 2nd Best Pitch category.', image: './images/mesalogo.png', imageAlt: 'Logo for MESA U HACKS 2025'},
        { title: 'Learning Assistant - California State University, East Bay', modalTitle: 'Learning Assistant', link: 'https://www.csueastbay.edu/stemlab/', description: 'At California State University, East Bay, I currently serve as a Learning Assistant for Python coursework or queries supporting 20+ students. I have collaborated with TAs to guide the development of assignments, coach students on study habits and how to use campus resources. Further, I lead 5-6 small-group support sessions before major assessments per semester. This work has sharpened how I both understand and explain concepts and structure practice so students can approach problems step by step and solve independently.', image: './images/stemlogo.jpeg', imageAlt: 'Logo for the STEM LAB at CSUEB.' },
        { title: 'Hack Hayward 2025', modalTitle: 'Hack Hayward', link: 'https://gdg.community.dev/events/details/google-gdg-on-campus-california-state-university-east-bay-hayward-united-states-presents-build-with-ai-hackhayward/', description: 'I participated in Hack Hayward 2025 in Hayward, CA. Our team built a small tool that used the Perplexity API and AI to encrypt and decrypt simple ciphers, like a Caesar cipher. I contributed through workshops and teamwork to move the cipher tool forward.', image: './images/hackhaywardlogo.jpg', imageAlt: 'Logo for Hack Hayward 2025' },
        { title: 'Student Tutor - Step Up Tutoring', modalTitle: 'Student Tutor', link: 'https://www.stepuptutoring.org/', description: 'At Step Up Tutoring from Oct 2023-May 2024, I served as a 4th-6th Grade Math Tutor. I guided students through core math concepts in one-on-one hourly sessions and built strong relationships over seven months, collaborating with staff and colleagues to support each student.', image: './images/stepuptutoringlogo.jpg', imageAlt: 'Logo for Step Up Tutoring' }
    ];
    const totalPages = Math.ceil(projectDetails.length / PROJECTS_PER_PAGE);
    let pages = [];

    function createProjectTile(project, index) {
        const tile = document.createElement('button');
        tile.className = 'project-item';
        tile.type = 'button';
        tile.dataset.projectIndex = String(index);

        const media = document.createElement('span');
        media.className = 'project-media';

        if (project.image) {
            const image = document.createElement('img');
            image.src = project.image;
            image.alt = project.imageAlt;
            image.className = 'project-image';
            media.appendChild(image);
        } else {
            const placeholder = document.createElement('span');
            placeholder.className = 'project-placeholder';
            placeholder.setAttribute('aria-hidden', 'true');
            placeholder.textContent = project.title.slice(0, 1);
            media.appendChild(placeholder);
        }

        const title = document.createElement('p');
        title.textContent = project.title;

        tile.append(media, title);
        return tile;
    }

    function createPage(pageIndex) {
        const page = document.createElement('div');
        page.className = 'project-page';
        page.dataset.pageIndex = String(pageIndex);

        const start = pageIndex * PROJECTS_PER_PAGE;
        projectDetails.slice(start, start + PROJECTS_PER_PAGE).forEach((project, offset) => {
            page.appendChild(createProjectTile(project, start + offset));
        });

        return page;
    }

    function renderPages() {
        carousel.replaceChildren();
        pages = Array.from({ length: totalPages }, (_, index) => createPage(index));
        pages.forEach((page) => carousel.appendChild(page));
    }

    function setTrackPosition(pageIndex, withTransition = true) {
        carousel.style.transition = withTransition ? 'transform 0.5s ease' : 'none';
        carousel.style.transform = `translateX(-${pageIndex * 100}%)`;
    }

    function goToPage(direction) {
        if (isTransitioning) return;

        const nextPage = (currentPage + direction + totalPages) % totalPages;
        if (nextPage === currentPage) return;

        const isForwardWrap = currentPage === totalPages - 1 && nextPage === 0 && direction > 0;
        const isBackwardWrap = currentPage === 0 && nextPage === totalPages - 1 && direction < 0;

        isTransitioning = true;

        if (isForwardWrap || isBackwardWrap) {
            const destinationPage = createPage(nextPage);
            destinationPage.classList.add('project-page--seam');

            if (isForwardWrap) {
                carousel.appendChild(destinationPage);
                carousel.style.transition = 'none';
                carousel.style.transform = `translateX(-${currentPage * 100}%)`;
                carousel.offsetHeight;
                carousel.style.transition = 'transform 0.5s ease';
                carousel.style.transform = `translateX(-${totalPages * 100}%)`;
            } else {
                carousel.insertBefore(destinationPage, carousel.firstChild);
                carousel.style.transition = 'none';
                carousel.style.transform = 'translateX(-100%)';
                carousel.offsetHeight;
                carousel.style.transition = 'transform 0.5s ease';
                carousel.style.transform = 'translateX(0)';
            }
        } else {
            setTrackPosition(nextPage);
        }

        currentPage = nextPage;
    }

    carousel.addEventListener('transitionend', (event) => {
        if (event.target !== carousel || event.propertyName !== 'transform') return;
        isTransitioning = false;
        renderPages();
        setTrackPosition(currentPage, false);
    });

    function openModal(index) {
        // If a link is provided for the project, render the title as an embedded anchor
        // so users can click it from inside the modal. Otherwise, render plain text.
        const proj = projectDetails[index];
        if (proj.link) {
            modalTitle.replaceChildren();
            const link = document.createElement('a');
            link.href = proj.link;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = proj.modalTitle ?? proj.title;
            modalTitle.appendChild(link);
        } else {
            modalTitle.replaceChildren();
            modalTitle.textContent = proj.modalTitle ?? proj.title;
        }
        modalDescription.textContent = projectDetails[index].description;
        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    prevButton.addEventListener('click', () => goToPage(-1));
    nextButton.addEventListener('click', () => goToPage(1));
    closeButton.addEventListener('click', closeModal);

    carousel.addEventListener('click', (event) => {
        const project = event.target.closest('.project-item');
        if (project) {
            openModal(Number(project.dataset.projectIndex));
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    renderPages();
    setTrackPosition(currentPage, false);

    // --- Contact Form --- //
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const userID = 'vJhzGuGNtmpO71Gbz';
        const serviceID = 'service_wx86a5r';
        const templateID = 'template_ix8v6bq';

        emailjs.sendForm(serviceID, templateID, this, userID)
            .then(() => {
                alert('Your message has been sent successfully!');
                contactForm.reset();
            }, (err) => {
                alert(JSON.stringify(err));
            });
    });

    const messageTextarea = document.getElementById('message');
    messageTextarea.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
});
