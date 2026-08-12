import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadSite } from './helpers/loadSite.js';

const typingText = 'Darien Chau';
const projectTexts = (document) => Array.from(document.querySelectorAll('.project-item p'), (item) => item.textContent);
const activeProjectText = (document) => document.querySelector('.project-item.active p').textContent;
const transitionEnd = (window, carousel) => carousel.dispatchEvent(new window.Event('transitionend'));

afterEach(() => {
  vi.useRealTimers();
});

describe('main.js browser behavior', () => {
  it('types the hero name and stops after completion', () => {
    vi.useFakeTimers();
    const site = loadSite();
    const typed = site.document.getElementById('typed');

    vi.advanceTimersByTime(120 * (typingText.length + 3));

    expect(typed.textContent).toBe(typingText);
    vi.advanceTimersByTime(120 * 5);
    expect(typed.textContent).toBe(typingText);
    site.cleanup();
  });

  it('toggles mobile navigation and closes it when a nav link is clicked', () => {
    const site = loadSite();
    const toggle = site.document.getElementById('nav-toggle');
    const links = site.document.getElementById('nav-links');

    toggle.click();
    expect(links.classList.contains('open')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    links.querySelector('a').click();
    expect(links.classList.contains('open')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    site.cleanup();
  });

  it('populates the footer year', () => {
    const site = loadSite();

    expect(site.document.getElementById('year').textContent).toBe(String(new Date().getFullYear()));
    site.cleanup();
  });

  it('initializes carousel clones in the expected order', () => {
    const site = loadSite();
    const texts = projectTexts(site.document);

    expect(texts).toHaveLength(10);
    expect(texts.slice(0, 4)).toEqual([
      'Hack Hayward 2025',
      'Student Tutor - Step Up Tutoring',
      'Reinforcement Learning - BattleBoxAI',
      'Machine Learning - DogCheck'
    ]);
    expect(texts.slice(-2)).toEqual([
      'Reinforcement Learning - BattleBoxAI',
      'Machine Learning - DogCheck'
    ]);
    expect(activeProjectText(site.document)).toBe('Reinforcement Learning - BattleBoxAI');
    site.cleanup();
  });

  it('updates active carousel item and transform for prev and next clicks', () => {
    const site = loadSite({ projectWidth: 200 });
    const carousel = site.document.querySelector('.projects-carousel');

    expect(carousel.style.transform).toBe('translateX(-200px)');

    site.document.getElementById('next-button').click();
    expect(activeProjectText(site.document)).toBe('Machine Learning - DogCheck');
    expect(carousel.style.transform).toBe('translateX(-400px)');
    transitionEnd(site.window, carousel);

    site.document.getElementById('prev-button').click();
    expect(activeProjectText(site.document)).toBe('Reinforcement Learning - BattleBoxAI');
    expect(carousel.style.transform).toBe('translateX(-200px)');
    site.cleanup();
  });

  it('wraps from the clone before the real range to the last real project', () => {
    const site = loadSite({ projectWidth: 200 });
    const carousel = site.document.querySelector('.projects-carousel');

    site.document.getElementById('prev-button').click();
    expect(activeProjectText(site.document)).toBe('Student Tutor - Step Up Tutoring');

    transitionEnd(site.window, carousel);
    expect(activeProjectText(site.document)).toBe('Student Tutor - Step Up Tutoring');
    expect(carousel.style.transform).toBe('translateX(-1200px)');
    expect(carousel.style.transition).toBe('none');
    site.cleanup();
  });

  it('wraps from the clone after the real range to the first real project', () => {
    const site = loadSite({ projectWidth: 200 });
    const carousel = site.document.querySelector('.projects-carousel');
    const next = site.document.getElementById('next-button');

    for (let index = 0; index < 6; index += 1) {
      next.click();
      transitionEnd(site.window, carousel);
    }

    expect(activeProjectText(site.document)).toBe('Reinforcement Learning - BattleBoxAI');
    expect(carousel.style.transform).toBe('translateX(-200px)');
    expect(carousel.style.transition).toBe('none');
    site.cleanup();
  });

  it('recomputes carousel transform on resize without changing the active project', () => {
    const site = loadSite({ projectWidth: 200 });
    const carousel = site.document.querySelector('.projects-carousel');

    site.document.getElementById('next-button').click();
    transitionEnd(site.window, carousel);
    site.window.__projectWidth = 250;
    site.window.dispatchEvent(new site.window.Event('resize'));

    expect(activeProjectText(site.document)).toBe('Machine Learning - DogCheck');
    expect(carousel.style.transform).toBe('translateX(-500px)');
    site.cleanup();
  });

  it('opens the modal from the active item and maps the carousel index to project details', () => {
    const site = loadSite();
    const carousel = site.document.querySelector('.projects-carousel');
    const modal = site.document.getElementById('project-modal');

    site.document.getElementById('next-button').click();
    transitionEnd(site.window, carousel);
    site.document.querySelector('.project-item.active').click();

    const titleLink = site.document.querySelector('#modal-title a');
    expect(modal.classList.contains('active')).toBe(true);
    expect(titleLink.textContent).toBe('DogCheck');
    expect(titleLink.href).toBe('https://colab.research.google.com/drive/181N1rNfrWUJV3g9JaynXLc1GGnDk0kI_?usp=sharing');
    expect(titleLink.target).toBe('_blank');
    expect(titleLink.rel).toBe('noopener noreferrer');
    expect(site.document.getElementById('modal-description').textContent).toContain('Between November and December 2025');
    site.cleanup();
  });

  it('closes the modal from the close button and overlay but not inside modal content', () => {
    const site = loadSite();
    const modal = site.document.getElementById('project-modal');

    site.document.querySelector('.project-item.active').click();
    expect(modal.classList.contains('active')).toBe(true);

    site.document.querySelector('.modal-content').click();
    expect(modal.classList.contains('active')).toBe(true);

    site.document.querySelector('.close-button').click();
    expect(modal.classList.contains('active')).toBe(false);

    site.document.querySelector('.project-item.active').click();
    site.window.dispatchEvent(new site.window.MouseEvent('click', { bubbles: true }));
    expect(modal.classList.contains('active')).toBe(true);
    modal.dispatchEvent(new site.window.MouseEvent('click', { bubbles: true }));
    expect(modal.classList.contains('active')).toBe(false);
    site.cleanup();
  });

  it('prevents contact form navigation and sends the expected EmailJS request', async () => {
    const sendFormMock = vi.fn(() => Promise.resolve({}));
    const site = loadSite({ sendFormMock });
    const form = site.document.getElementById('contact-form');
    form.reset = vi.fn();

    const submitEvent = new site.window.Event('submit', { bubbles: true, cancelable: true });
    const dispatchResult = form.dispatchEvent(submitEvent);
    await Promise.resolve();

    expect(dispatchResult).toBe(false);
    expect(sendFormMock).toHaveBeenCalledWith(
      'service_wx86a5r',
      'template_ix8v6bq',
      form,
      'vJhzGuGNtmpO71Gbz'
    );
    expect(site.alertMock).toHaveBeenCalledWith('Your message has been sent successfully!');
    expect(form.reset).toHaveBeenCalledTimes(1);
    site.cleanup();
  });

  it('alerts with serialized EmailJS failures', async () => {
    const error = { text: 'rejected' };
    const sendFormMock = vi.fn(() => Promise.reject(error));
    const site = loadSite({ sendFormMock });

    site.document.getElementById('contact-form').dispatchEvent(
      new site.window.Event('submit', { bubbles: true, cancelable: true })
    );
    await Promise.resolve();

    expect(site.alertMock).toHaveBeenCalledWith(JSON.stringify(error));
    site.cleanup();
  });

  it('auto-grows the message textarea from auto to its scroll height', () => {
    const site = loadSite();
    const textarea = site.document.getElementById('message');
    const heightAssignments = [];

    Object.defineProperty(textarea, 'scrollHeight', {
      configurable: true,
      value: 144
    });
    Object.defineProperty(textarea.style, 'height', {
      configurable: true,
      get() {
        return heightAssignments.at(-1) ?? '';
      },
      set(value) {
        heightAssignments.push(value);
      }
    });

    textarea.dispatchEvent(new site.window.Event('input', { bubbles: true }));

    expect(heightAssignments).toEqual(['auto', '144px']);
    site.cleanup();
  });
});
