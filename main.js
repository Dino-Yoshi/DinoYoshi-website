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

// Carousel, modal, nav, and contact form logic
document.addEventListener('DOMContentLoaded', () => {
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

    let projects = Array.from(document.querySelectorAll('.project-item'));
    const projectCount = projects.length;
    let isTransitioning = false;
    // How many items are cloned onto each end of the track. 1 isn't enough: while resting on
    // that single clone mid-wrap, the far neighbor slot (3 items are visible at once) has
    // nothing to show, which pops in abruptly once the loop snaps. A 2nd clone on each side
    // fills that neighbor slot so every resting frame during the wrap is fully populated.
    const CLONE_COUNT = 2;
    let currentProject = CLONE_COUNT; // Start at the first real project (not a clone)

    const projectDetails = [
        { title: 'BattleBoxAI', link: 'https://github.com/Dino-Yoshi/PPO-RL-Model', description: 'In the month of January 2026, I designed BattleBoxAI, a reinforcement learning project that was tasked with creating an agent that was capable of taking input (bullet positions) and outputting actions (movement). Through existing technologies and tools, specifically Stable-Baselines3 and TensorBoard, I refined my model through PPO, or Proximal Policy Optimization. The end result was an average score of 476 out of 1000 based on survival duration over the course of 10 episodes.' },
        { title: 'DogCheck', link: 'https://colab.research.google.com/drive/181N1rNfrWUJV3g9JaynXLc1GGnDk0kI_?usp=sharing', description: 'Between November and December 2025, I developed DogCheck, a machine learning project aimed at identifying dog groups or roles from a rigorously labeled dataset comprised of over 250+ breeds. Utilizing fundamental libraries such as Pandas and NumPy for data handling alongside scikit-learn for model development, I trained a gradient boosting classifier (XGBClassifier) that achieved an accuracy of 79% on unseen data. Mainly, most of my time was spent on data preprocessing and feature engineering more than anything else.'},
        { title: 'MESA U HACKS 2.0', link: 'https://github.com/Jdeww/Mesa-U-Hacks-2.0', description: 'At MESA U Hacks 2.0 in September 2025, I participated on a team building a study tool called NimbusNotes. I developed the backend and API in Python/FastAPI, integrating AWS services and the model with the front end. The app accepted file and image uploads; GPT-4.1 Mini converted the content into flashcards and quizzes for solo review or group competition. Our team won the 2nd Best Pitch category.'},
        { title: 'Learning Assistant', link: 'https://www.csueastbay.edu/stemlab/', description: 'At California State University, East Bay, I currently serve as a Learning Assistant for Python coursework or queries supporting 20+ students. I have collaborated with TAs to guide the development of assignments, coach students on study habits and how to use campus resources. Further, I lead 5-6 small-group support sessions before major assessments per semester. This work has sharpened how I both understand and explain concepts and structure practice so students can approach problems step by step and solve independently.' },
        { title: 'Hack Hayward', link: 'https://gdg.community.dev/events/details/google-gdg-on-campus-california-state-university-east-bay-hayward-united-states-presents-build-with-ai-hackhayward/', description: 'I participated in Hack Hayward 2025 in Hayward, CA. Our team built a small tool that used the Perplexity API and AI to encrypt and decrypt simple ciphers, like a Caesar cipher. I contributed through workshops and teamwork to move the cipher tool forward.' },
        { title: 'Student Tutor', link: 'https://www.stepuptutoring.org/', description: 'At Step Up Tutoring from Oct 2023-May 2024, I served as a 4th-6th Grade Math Tutor. I guided students through core math concepts in one-on-one hourly sessions and built strong relationships over seven months, collaborating with staff and colleagues to support each student.' }
    ];

    // 2. Carousel Setup (Infinite Loop)
    // Clone the last CLONE_COUNT projects onto the front and the first CLONE_COUNT onto the
    // back, so the structure looks like: [clone(n-2), clone(n-1), 0, 1, ..., n-1, clone(0), clone(1)]
    for (let i = 0; i < CLONE_COUNT; i++) {
        const endClone = projects[projectCount - 1 - i].cloneNode(true);
        carousel.insertBefore(endClone, carousel.firstChild);
    }
    for (let i = 0; i < CLONE_COUNT; i++) {
        const startClone = projects[i].cloneNode(true);
        carousel.appendChild(startClone);
    }
    projects = Array.from(document.querySelectorAll('.project-item'));

    // 3. Carousel Logic
    function updateCarousel(withTransition = true) {
        carousel.style.transition = withTransition ? 'transform 0.5s ease' : 'none';

        // Position the carousel to center the active project.
        // Use layout width (offsetWidth), not getBoundingClientRect, since active/inactive
        // items are scaled via CSS transform and a transformed item's rendered width would
        // throw the offset off depending on which item happens to be read.
        const projectWidth = projects[0].offsetWidth;
        const offset = -(currentProject - 1) * projectWidth;
        carousel.style.transform = `translateX(${offset}px)`;

        // Update the 'active' class for styling.
        projects.forEach((project, i) => {
            project.classList.remove('active');
            if (i === currentProject) {
                project.classList.add('active');
            }
        });
    }

    function shiftProjects(direction) {
        if (isTransitioning) return;
        isTransitioning = true;
        currentProject += direction;
        updateCarousel();
    }

    // This event listener creates the seamless loop.
    // When the carousel finishes transitioning to rest on the clone immediately adjacent to
    // the real range (which still has a fully populated neighbor slot thanks to the buffer
    // clone beyond it), it instantly jumps to the equivalent real project.
    carousel.addEventListener('transitionend', () => {
        isTransitioning = false;
        if (currentProject === CLONE_COUNT - 1) { // Resting on the clone just before the real range
            currentProject = CLONE_COUNT + projectCount - 1; // Jump to the real last project
            updateCarousel(false);
        } else if (currentProject === CLONE_COUNT + projectCount) { // Resting on the clone just after the real range
            currentProject = CLONE_COUNT; // Jump to the real first project
            updateCarousel(false);
        }
    });

    // 4. Modal Logic
    function openModal(index) {
        // If a link is provided for the project, render the title as an embedded anchor
        // so users can click it from inside the modal. Otherwise, render plain text.
        const proj = projectDetails[index];
        if (proj.link) {
            modalTitle.innerHTML = `<a href="${proj.link}" target="_blank" rel="noopener noreferrer">${proj.title}</a>`;
        } else {
            modalTitle.textContent = proj.title;
        }
        modalDescription.textContent = projectDetails[index].description;
        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    // 5. Event Listeners
    prevButton.addEventListener('click', () => shiftProjects(-1));
    nextButton.addEventListener('click', () => shiftProjects(1));
    closeButton.addEventListener('click', closeModal);

    carousel.addEventListener('click', (event) => {
        const project = event.target.closest('.project-item.active');
        if (project) {
            // Calculate the original index of the project from the projectDetails array.
            // This is necessary because the 'currentProject' index includes the clones.
            let originalIndex = (currentProject - CLONE_COUNT + projectCount) % projectCount;
            openModal(originalIndex);
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Initial setup
    updateCarousel(false);

    // Recompute the transform offset on resize (item width changes across breakpoints).
    window.addEventListener('resize', () => updateCarousel(false));

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
