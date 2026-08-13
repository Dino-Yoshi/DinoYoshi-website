import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { vi } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const mainScript = fs.readFileSync(path.join(repoRoot, 'main.js'), 'utf8');

export function loadSite({ projectWidth = 200, reducedMotion = true, sendFormMock } = {}) {
  const dom = new JSDOM(html, {
    url: 'https://example.test/',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });

  const { window } = dom;
  const observers = [];
  const alertMock = vi.fn();
  const emailSendFormMock = sendFormMock ?? vi.fn(() => Promise.resolve({}));

  class MockIntersectionObserver {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.observed = [];
      observers.push(this);
    }

    observe(element) {
      this.observed.push(element);
    }

    unobserve(element) {
      this.observed = this.observed.filter((observed) => observed !== element);
    }

    disconnect() {
      this.observed = [];
    }
  }

  window.IntersectionObserver = MockIntersectionObserver;
  window.emailjs = { sendForm: emailSendFormMock };
  window.alert = alertMock;
  window.__projectWidth = projectWidth;
  window.requestAnimationFrame = vi.fn(() => 1);
  window.cancelAnimationFrame = vi.fn();
  window.matchMedia = vi.fn((query) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? reducedMotion : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  }));

  const canvasContextMock = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn()
  };

  window.HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
    if (contextType !== '2d') return null;
    return canvasContextMock;
  });

  Object.defineProperty(window.HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get() {
      return this.classList?.contains('project-item') ? window.__projectWidth : 0;
    }
  });

  window.eval(`${mainScript}\n//# sourceURL=main.js`);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded', {
    bubbles: true,
    cancelable: true
  }));

  return {
    window,
    document: window.document,
    observers,
    alertMock,
    sendFormMock: emailSendFormMock,
    cleanup: () => window.close()
  };
}
