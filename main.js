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

// Carousel and modal logic
document.addEventListener('DOMContentLoaded', () => {
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
    let currentProject = 1; // Start at the first real project (not the clone)

    const projectDetails = [
        { title: 'MESA U HACKS 2.0', description: 'At MESA U Hacks 2.0 in September 2025, I participated on a team building a study tool called NimbusNotes. I developed the backend and API in Python/FastAPI, integrating AWS services and the model with the front end. The app accepted file and image uploads; GPT-4.1 Mini converted the content into flashcards and quizzes for solo review or group competition. Our team won the 2nd Best Pitch category.' },
        { title: 'Learning Assistant', description: 'At California State University, East Bay, I currently serve as a Learning Assistant for Python coursework or queries supporting 20+ students. I have collaborated with TAs to guide the development of assignments, coach students on study habits and how to use campus resources. Further, I lead 5-6 small-group support sessions before major assessments per semester. This work has sharpened how I both understand and explain concepts and structure practice so students can approach problems step by step and solve independently.' },
        { title: 'Hack Hayward', description: 'I participated in Hack Hayward 2025 in Hayward, CA. Our team built a small tool that used the Perplexity API and AI to encrypt and decrypt simple ciphers, like a Caesar cipher. I contributed through workshops and teamwork to move the cipher tool forward.' },
        { title: 'Student Tutor', description: 'At Step Up Tutoring from Oct 2023-May 2024, I served as a 4th-6th Grade Math Tutor. I guided students through core math concepts in one-on-one hourly sessions and built strong relationships over seven months, collaborating with staff and colleagues to support each student.' }
    ];

    // 2. Carousel Setup (Infinite Loop)
    // Clone the first and last projects to create a seamless loop.
    // The carousel will now have a structure like: [last-clone, 0, 1, 2, 3, 0-clone]
    const firstClone = projects[0].cloneNode(true);
    const lastClone = projects[projectCount - 1].cloneNode(true);
    carousel.appendChild(firstClone);
    carousel.insertBefore(lastClone, projects[0]);
    projects = Array.from(document.querySelectorAll('.project-item'));

    // 3. Carousel Logic
    function updateCarousel(withTransition = true) {
        carousel.style.transition = withTransition ? 'transform 0.5s ease' : 'none';
        
        // Position the carousel to center the active project.
        // We divide the container width by 3 to get the width of a single project.
        const projectWidth = carousel.offsetWidth / 3;
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
    // When the carousel finishes transitioning to a clone, it instantly jumps to the real project.
    carousel.addEventListener('transitionend', () => {
        isTransitioning = false;
        if (currentProject === 0) { // If at the last clone
            currentProject = projectCount; // Jump to the real last project
            updateCarousel(false);
        } else if (currentProject === projectCount + 1) { // If at the first clone
            currentProject = 1; // Jump to the real first project
            updateCarousel(false);
        }
    });

    // 4. Modal Logic
    function openModal(index) {
        modalTitle.textContent = projectDetails[index].title;
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
            let originalIndex = (currentProject - 1 + projectCount) % projectCount;
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
