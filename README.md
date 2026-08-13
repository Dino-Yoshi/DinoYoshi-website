# Darien Chau - Personal Portfolio

## About The Project

This is my personal portfolio website, showcasing my skills, projects, and experience as a Computer Science student at Cal State East Bay. It's a static single-page site with an animated constellation background, a paginated project grid with a detail panel, and an EmailJS-backed contact form.

## Built With

* HTML
* CSS
* JavaScript
* [EmailJS](https://www.emailjs.com/) for the contact form

## Development Checks

This static site includes a dev-only test suite for browser behavior plus a local link and asset checker.

```bash
npm install
npm test           # DOM behavior tests (Vitest)
npm run check:links # Validate local links/assets and project detail links
npm run verify      # Run both of the above
```

These checks also run in CI on every push and pull request (`.github/workflows/test.yml`).

## Contact

Darien Chau - darien.chau@gmail.com
