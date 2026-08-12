import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { vi } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const mainScript = fs.readFileSync(path.join(repoRoot, 'main.js'), 'utf8');

export function loadSite({ projectWidth = 200, sendFormMock } = {}) {
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
