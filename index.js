/**
 * Main entry point for JavaScript users
 * Re-exports the built TypeScript module with full compatibility
 */

// Import the built module (generated from TypeScript)
const helpers = require('./dist/index.js');

module.exports = helpers;