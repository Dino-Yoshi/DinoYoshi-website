#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const repoRoot = path.resolve(__dirname, '..');
const siteOrigin = 'https://example.test';
const failures = {
  html: [],
  anchors: [],
  projectLinks: []
};

function addFailure(group, message) {
  failures[group].push(message);
}

function isExternal(url) {
  return url.origin !== siteOrigin;
}

function validateLocalPath(rawValue, url) {
  const decodedPath = decodeURIComponent(url.pathname);
  const absolutePath = path.resolve(repoRoot, `.${decodedPath}`);
  const relativePath = path.relative(repoRoot, absolutePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    addFailure('html', `${rawValue} resolves outside the repository`);
    return;
  }

  if (!fs.existsSync(absolutePath)) {
    addFailure('html', `${rawValue} resolves to missing file ${relativePath}`);
  }
}

function validateHtmlLinks() {
  const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
  const dom = new JSDOM(html, { url: siteOrigin });
  const { document } = dom.window;

  document.querySelectorAll('[href], [src]').forEach((element) => {
    ['href', 'src'].forEach((attribute) => {
      if (!element.hasAttribute(attribute)) return;

      const rawValue = element.getAttribute(attribute).trim();
      if (!rawValue) return;

      if (rawValue.startsWith('#')) {
        const id = decodeURIComponent(rawValue.slice(1));
        if (!id || !document.getElementById(id)) {
          addFailure('anchors', `${rawValue} does not match an element id`);
        }
        return;
      }

      let parsed;
      try {
        parsed = new URL(rawValue, siteOrigin);
      } catch (error) {
        addFailure('html', `${attribute}="${rawValue}" is not a valid URL or local path`);
        return;
      }

      if (isExternal(parsed)) {
        if (parsed.protocol !== 'https:') {
          addFailure('html', `${attribute}="${rawValue}" must use https:`);
        }
        return;
      }

      validateLocalPath(rawValue, parsed);

      if (parsed.hash) {
        const id = decodeURIComponent(parsed.hash.slice(1));
        if (!id || !document.getElementById(id)) {
          addFailure('anchors', `${rawValue} has a missing fragment target`);
        }
      }
    });
  });
}

function extractProjectLinks(source) {
  const links = [];
  const linkPropertyPattern = /\blink\s*:\s*(['"`])((?:\\.|(?!\1)[\s\S])*)\1/g;
  let match;

  while ((match = linkPropertyPattern.exec(source)) !== null) {
    links.push(match[2]);
  }

  return links;
}

function validateProjectLinks() {
  const source = fs.readFileSync(path.join(repoRoot, 'main.js'), 'utf8');
  const links = extractProjectLinks(source);

  if (links.length === 0) {
    addFailure('projectLinks', 'No projectDetails link properties were extracted from main.js');
    return;
  }

  if (links.length < 6) {
    addFailure('projectLinks', `Expected at least 6 projectDetails links, found ${links.length}`);
  }

  links.forEach((link, index) => {
    let parsed;
    try {
      parsed = new URL(link);
    } catch (error) {
      addFailure('projectLinks', `projectDetails link ${index + 1} is not a valid absolute URL: ${link}`);
      return;
    }

    if (parsed.protocol !== 'https:') {
      addFailure('projectLinks', `projectDetails link ${index + 1} must use https:, found ${parsed.protocol}: ${link}`);
    }
  });
}

function printFailures() {
  const groups = Object.entries(failures).filter(([, messages]) => messages.length > 0);
  if (groups.length === 0) {
    console.log('Link and asset checks passed.');
    return;
  }

  console.error('Link and asset checks failed:');
  groups.forEach(([group, messages]) => {
    console.error(`\n${group}:`);
    messages.forEach((message) => console.error(`- ${message}`));
  });
  process.exitCode = 1;
}

validateHtmlLinks();
validateProjectLinks();
printFailures();
