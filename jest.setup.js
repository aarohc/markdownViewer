import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure Testing Library
configure({
  asyncUtilTimeout: 2000,
  testIdAttribute: 'data-testid',
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress React 18 act() warnings more specifically
const originalError = console.error;
console.error = (...args) => {
  if (
    /Warning.*not wrapped in act/.test(args[0]) ||
    /Warning.*ReactDOMTestUtils.act/.test(args[0])
  ) {
    return;
  }
  originalError.call(console, ...args);
}; 