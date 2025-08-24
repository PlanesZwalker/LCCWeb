# Testing Guide

## Pages
- Comprehensive Suite: `/public/test-suite-comprehensive.html`
- Modular Tests: `/public/test-modular.html`
- 3D Game Test: `/public/test-optimized-3d-game.html`

## Modular Test
- Open the page and click "Run All Tests"; all tests should pass

## Comprehensive Suite
- Run 3D, 2D, Performance, Compatibility, Accessibility, Code Quality sections
- Review summary counters and logs

## Notes
- Tests run in-browser; use multiple browsers for cross-browser coverage
- For mobile, open the same URLs on device or device emulators

## CLI Tests (optional)
- `npm test` runs the configured Jest suite for E2E tests under `public/js/tests/e2e/`
- `npm run test:coverage` produces a coverage report if unit tests are enabled
