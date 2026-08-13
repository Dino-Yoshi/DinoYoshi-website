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

    const PROJECTS_PER_PAGE = 6;
    const PLACEHOLDER_DESCRIPTION = 'Project details coming soon — check back for a full write-up of this build.';

    let isTransitioning = false;
    let currentPage = 0;

    const projectDetails = [
        { title: 'Reinforcement Learning - BattleBoxAI', modalTitle: 'BattleBoxAI', link: 'https://github.com/Dino-Yoshi/PPO-RL-Model', description: 'In the month of January 2026, I designed BattleBoxAI, a reinforcement learning project that was tasked with creating an agent that was capable of taking input (bullet positions) and outputting actions (movement). Through existing technologies and tools, specifically Stable-Baselines3 and TensorBoard, I refined my model through PPO, or Proximal Policy Optimization. The end result was an average score of 476 out of 1000 based on survival duration over the course of 10 episodes.', image: './images/battleboxai.jpg', imageAlt: 'BattleBoxAI' },
        { title: 'Machine Learning - DogCheck', modalTitle: 'DogCheck', link: 'https://colab.research.google.com/drive/181N1rNfrWUJV3g9JaynXLc1GGnDk0kI_?usp=sharing', description: 'Between November and December 2025, I developed DogCheck, a machine learning project aimed at identifying dog groups or roles from a rigorously labeled dataset comprised of over 250+ breeds. Utilizing fundamental libraries such as Pandas and NumPy for data handling alongside scikit-learn for model development, I trained a gradient boosting classifier (XGBClassifier) that achieved an accuracy of 79% on unseen data. Mainly, most of my time was spent on data preprocessing and feature engineering more than anything else.', image: './images/dogCheck.jpg', imageAlt: 'DogCheck'},
        { title: 'MESA U HACKS 2025 - 2nd Best Pitch', modalTitle: 'MESA U HACKS 2.0', link: 'https://github.com/Jdeww/Mesa-U-Hacks-2.0', description: 'At MESA U Hacks 2.0 in September 2025, I participated on a team building a study tool called NimbusNotes. I developed the backend and API in Python/FastAPI, integrating AWS services and the model with the front end. The app accepted file and image uploads; GPT-4.1 Mini converted the content into flashcards and quizzes for solo review or group competition. Our team won the 2nd Best Pitch category.', image: './images/mesalogo.png', imageAlt: 'Logo for MESA U HACKS 2025'},
        { title: 'Learning Assistant - California State University, East Bay', modalTitle: 'Learning Assistant', link: 'https://www.csueastbay.edu/stemlab/', description: 'At California State University, East Bay, I currently serve as a Learning Assistant for Python coursework or queries supporting 20+ students. I have collaborated with TAs to guide the development of assignments, coach students on study habits and how to use campus resources. Further, I lead 5-6 small-group support sessions before major assessments per semester. This work has sharpened how I both understand and explain concepts and structure practice so students can approach problems step by step and solve independently.', image: './images/stemlogo.jpeg', imageAlt: 'Logo for the STEM LAB at CSUEB.' },
        { title: 'Hack Hayward 2025', modalTitle: 'Hack Hayward', link: 'https://gdg.community.dev/events/details/google-gdg-on-campus-california-state-university-east-bay-hayward-united-states-presents-build-with-ai-hackhayward/', description: 'I participated in Hack Hayward 2025 in Hayward, CA. Our team built a small tool that used the Perplexity API and AI to encrypt and decrypt simple ciphers, like a Caesar cipher. I contributed through workshops and teamwork to move the cipher tool forward.', image: './images/hackhaywardlogo.jpg', imageAlt: 'Logo for Hack Hayward 2025' },
        { title: 'Student Tutor - Step Up Tutoring', modalTitle: 'Student Tutor', link: 'https://www.stepuptutoring.org/', description: 'At Step Up Tutoring from Oct 2023-May 2024, I served as a 4th-6th Grade Math Tutor. I guided students through core math concepts in one-on-one hourly sessions and built strong relationships over seven months, collaborating with staff and colleagues to support each student.', image: './images/stepuptutoringlogo.jpg', imageAlt: 'Logo for Step Up Tutoring' },
        { title: 'Immersive Enchanting', description: PLACEHOLDER_DESCRIPTION },
        { title: 'Catenna', description: PLACEHOLDER_DESCRIPTION },
        { title: 'Minecraft Mod Development', description: PLACEHOLDER_DESCRIPTION }
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
