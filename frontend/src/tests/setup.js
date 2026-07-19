import '@testing-library/jest-dom';

// Polyfill matchMedia for jsdom (some libs probe for it)
if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  });
}
