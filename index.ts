/**
 * Main entry point for baileys-helper TypeScript package
 * Provides backward compatibility with JavaScript while supporting TypeScript
 */

// For CommonJS (JavaScript) users
if (typeof module !== 'undefined' && module.exports) {
  const helpers = require('./dist/index.js');
  module.exports = helpers;
}

// For TypeScript/ES modules users
export * from './dist/index.js';
export { default } from './dist/index.js';