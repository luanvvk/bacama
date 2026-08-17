import '@testing-library/jest-dom';

/*
 * Radix primitives (Select, Dialog, DropdownMenu, ...) call browser APIs
 * jsdom doesn't implement — without these, interacting with them in tests
 * throws "not a function" before the assertion ever runs.
 */
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
if (!('ResizeObserver' in window)) {
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-expect-error jsdom has no ResizeObserver implementation
  window.ResizeObserver = MockResizeObserver;
}
