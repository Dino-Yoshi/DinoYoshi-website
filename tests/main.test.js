import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadSite } from './helpers/loadSite.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(repoRoot, 'style.css'), 'utf8');
const typingText = 'Darien Chau';
const placeholderDescription = 'Project details coming soon — check back for a full write-up of this build.';

const pageTexts = (page) => Array.from(page.querySelectorAll('.project-item p'), (item) => item.textContent);
const transitionEnd = (window, carousel) => {
  const event = new window.Event('transitionend', { bubbles: true });
  Object.defineProperty(event, 'propertyName', {
    configurable: true,
    value: 'transform'
  });
  carousel.dispatchEvent(event);
};

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

  it('schedules the constellation animation when motion is enabled', () => {
    const site = loadSite({ reducedMotion: false });

    expect(site.window.requestAnimationFrame).toHaveBeenCalled();
    site.cleanup();
  });

  it('renders 10 project tiles in 6-item pages without clone-buffer items', () => {
    const site = loadSite();
    const pages = Array.from(site.document.querySelectorAll('.project-page'));
    const projects = Array.from(site.document.querySelectorAll('.project-item'));

    expect(projects).toHaveLength(10);
    expect(pages).toHaveLength(2);
    expect(pageTexts(pages[0])).toEqual([
      'Reinforcement Learning - BattleBoxAI',
      'Machine Learning - DogCheck',
      'MESA U HACKS 2025 - 2nd Best Pitch',
      'Learning Assistant - California State University, East Bay',
      'Hack Hayward 2025',
      'Student Tutor - Step Up Tutoring'
    ]);
    expect(pageTexts(pages[1])).toEqual([
      'Immersive Enchanting',
      'Catenna',
      'Minecraft Mod Development',
      'SI Leader - California State University, East Bay'
    ]);
    expect(projects.map((project) => project.dataset.projectIndex)).toEqual([
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9'
    ]);
    expect(site.document.querySelector('.project-item.active')).toBeNull();
    site.cleanup();
  });

  it('keeps the partial second page in the first row-major cells', () => {
    const site = loadSite();
    const secondPage = site.document.querySelectorAll('.project-page')[1];
    const tiles = Array.from(secondPage.children);

    expect(secondPage.dataset.pageIndex).toBe('1');
    expect(tiles).toHaveLength(4);
    expect(tiles.map((tile) => tile.dataset.projectIndex)).toEqual(['6', '7', '8', '9']);
    expect(css).toMatch(/\.project-page\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
    site.cleanup();
  });

  it('navigates by page and wraps in both directions with finite seam pages', () => {
    const site = loadSite();
    const carousel = site.document.querySelector('.projects-carousel');
    const prev = site.document.getElementById('prev-button');
    const next = site.document.getElementById('next-button');

    expect(site.document.getElementById('prev-button').getAttribute('aria-label')).toBe('Previous page');
    expect(site.document.getElementById('next-button').getAttribute('aria-label')).toBe('Next page');
    expect(carousel.style.transform).toBe('translateX(-0%)');

    next.click();
    expect(carousel.style.transform).toBe('translateX(-100%)');
    transitionEnd(site.window, carousel);
    expect(site.document.querySelectorAll('.project-page')).toHaveLength(2);

    next.click();
    expect(site.document.querySelectorAll('.project-page')).toHaveLength(3);
    expect(carousel.style.transform).toBe('translateX(-200%)');
    transitionEnd(site.window, carousel);
    expect(site.document.querySelectorAll('.project-page')).toHaveLength(2);
    expect(carousel.style.transform).toBe('translateX(-0%)');

    prev.click();
    expect(site.document.querySelectorAll('.project-page')).toHaveLength(3);
    expect(carousel.style.transform).toBe('translateX(0)');
    transitionEnd(site.window, carousel);
    expect(site.document.querySelectorAll('.project-page')).toHaveLength(2);
    expect(carousel.style.transform).toBe('translateX(-100%)');
    site.cleanup();
  });

  it('ignores rapid page clicks while a transition is active', () => {
    const site = loadSite();
    const carousel = site.document.querySelector('.projects-carousel');
    const next = site.document.getElementById('next-button');

    next.click();
    next.click();
    expect(carousel.style.transform).toBe('translateX(-100%)');
    expect(site.document.querySelectorAll('.project-page')).toHaveLength(2);
    transitionEnd(site.window, carousel);
    site.cleanup();
  });

  it('defines the hover pop-out hook and contained square image rules', () => {
    expect(css).toMatch(/\.project-item:hover,\s*\.project-item:focus-visible\s*{[^}]*scale\(1\.02\)/s);
    expect(css).toMatch(/\.project-page\s*{[^}]*box-sizing:\s*border-box/s);
    expect(css).toMatch(/\.project-page\s*{[^}]*padding:\s*1\.25rem/s);
    expect(css).toMatch(/\.project-media\s*{[^}]*aspect-ratio:\s*1 \/ 1/s);
    expect(css).toMatch(/\.project-image\s*{[^}]*object-fit:\s*contain/s);
    expect(css).toMatch(/@media \(max-width:\s*800px\)\s*{[\s\S]*\.project-page\s*{[^}]*grid-template-columns:\s*1fr/s);
  });

  it('opens the centered project card from any visible tile with linked project details', () => {
    const site = loadSite();
    const modal = site.document.getElementById('project-modal');

    site.document.querySelector('[data-project-index="1"]').click();

    const titleLink = site.document.querySelector('#modal-title a');
    expect(modal.classList.contains('active')).toBe(true);
    expect(titleLink.textContent).toBe('DogCheck');
    expect(titleLink.href).toBe('https://colab.research.google.com/drive/181N1rNfrWUJV3g9JaynXLc1GGnDk0kI_?usp=sharing');
    expect(titleLink.target).toBe('_blank');
    expect(titleLink.rel).toBe('noopener noreferrer');
    expect(site.document.getElementById('modal-description').textContent).toContain('Between November and December 2025');
    expect(css).toMatch(/\.modal\s*{[^}]*display:\s*flex/s);
    expect(css).toMatch(/\.modal\s*{[^}]*justify-content:\s*center/s);
    expect(css).toMatch(/\.modal\s*{[^}]*align-items:\s*center/s);
    expect(css).not.toMatch(/\.modal\.active\s*{[^}]*align-items:\s*flex-end/s);
    expect(css).toMatch(/\.modal-content\s*{[^}]*max-width:\s*48rem/s);
    expect(css).not.toMatch(/\.modal-content\s*{[^}]*min-height:/s);
    expect(css).toMatch(/\.modal-content\s*{[^}]*transform:\s*translateY\(2rem\)/s);
    expect(css).toMatch(/\.modal\.active \.modal-content\s*{[^}]*transform:\s*translateY\(0\)/s);
    site.cleanup();
  });

  it('opens link-less projects as plain titles with their icon images intact', () => {
    const site = loadSite();
    const linklessTile = site.document.querySelector('[data-project-index="6"]');

    expect(linklessTile.querySelector('img')).not.toBeNull();
    expect(linklessTile.querySelector('.project-placeholder')).toBeNull();

    linklessTile.click();

    expect(site.document.querySelector('#modal-title a')).toBeNull();
    expect(site.document.getElementById('modal-title').textContent).toBe('Immersive Enchanting');
    expect(site.document.getElementById('modal-description').textContent).toBe(placeholderDescription);
    site.cleanup();
  });

  it('clears a previous title anchor when opening a placeholder project', () => {
    const site = loadSite();

    site.document.querySelector('[data-project-index="0"]').click();
    expect(site.document.querySelector('#modal-title a')).not.toBeNull();

    site.document.querySelector('[data-project-index="7"]').click();
    expect(site.document.querySelector('#modal-title a')).toBeNull();
    expect(site.document.getElementById('modal-title').textContent).toBe('Catenna');
    site.cleanup();
  });

  it('closes the modal from the close button and overlay but not inside modal content', () => {
    const site = loadSite();
    const modal = site.document.getElementById('project-modal');

    site.document.querySelector('[data-project-index="0"]').click();
    expect(modal.classList.contains('active')).toBe(true);

    site.document.querySelector('.modal-content').click();
    expect(modal.classList.contains('active')).toBe(true);

    site.document.querySelector('.close-button').click();
    expect(modal.classList.contains('active')).toBe(false);

    site.document.querySelector('[data-project-index="0"]').click();
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
