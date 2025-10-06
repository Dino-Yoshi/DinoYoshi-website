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
    const projects = document.querySelectorAll('.project-item');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    let currentProject = 0;

    const projectDetails = [
        {
            title: 'MESA U HACKS 2.0',
            description: 'At MESA U Hacks 2.0 in September 2025, I participated on a team building a study tool called NimbusNotes. I developed the backend and API in Python/FastAPI, integrating AWS services and the model with the front end. The app accepted file and image uploads; GPT-4.1 Mini converted the content into flashcards and quizzes for solo review or group competition. Our team won the 2nd Best Pitch category.'
        },
        {
            title: 'Learning Assistant',
            description: 'At California State University, East Bay, I currently serve as a Learning Assistant for Python coursework or queries supporting 20+ students. I have collaborated with TAs to guide the development of assignments, coach students on study habits and how to use campus resources. Further, I lead 5-6 small-group support sessions before major assessments per semester. This work has sharpened how I both understand and explain concepts and structure practice so students can approach problems step by step and solve independently.'
        },
        {
            title: 'Hack Hayward',
            description: 'I participated in Hack Hayward 2025 in Hayward, CA. Our team built a small tool that used the Perplexity API and AI to encrypt and decrypt simple ciphers, like a Caesar cipher. I contributed through workshops and teamwork to move the cipher tool forward.'
        },
        {
            title: 'Student Tutor',
            description: 'At Step Up Tutoring from Oct 2023-May 2024, I served as a 4th-6th Grade Math Tutor. I guided students through core math concepts in one-on-one hourly sessions and built strong relationships over seven months, collaborating with staff and colleagues to support each student.'
        }
    ];

    const modal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const closeButton = document.querySelector('.close-button');

    function showProject(index) {
      projects.forEach((project, i) => {
        if (i === index) {
          project.classList.add('active');
        } else {
          project.classList.remove('active');
        }
      });
    }

    function openModal(index) {
        modalTitle.textContent = projectDetails[index].title;
        modalDescription.textContent = projectDetails[index].description;
        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    prevButton.addEventListener('click', () => {
      currentProject = (currentProject - 1 + projects.length) % projects.length;
      showProject(currentProject);
    });

    nextButton.addEventListener('click', () => {
      currentProject = (currentProject + 1) % projects.length;
      showProject(currentProject);
    });

    const projectsCarousel = document.querySelector('.projects-carousel');

    projectsCarousel.addEventListener('click', (event) => {
        const project = event.target.closest('.project-item');
        if (project) {
            const index = Array.from(projects).indexOf(project);
            openModal(index);
        }
    });

    closeButton.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });

    // Contact form logic
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
        messageTextarea.style.height = 'auto';
        messageTextarea.style.height = (messageTextarea.scrollHeight) + 'px';
    });
});
