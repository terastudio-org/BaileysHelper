/**
 * Central export surface for this package.
 * Re-exports helper functions from local modules and exposes package metadata.
 * TypeScript version
 */

import * as Buttons from './helpers/buttons.js';
import * as Validation from './types/validation.js';
import * as Types from './types/index.js';

// Import package.json for metadata
import pkg from './package.json' assert { type: 'json' };

/**
 * Get package information
 */
export function getPackageInfo() {
  return {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
    main: pkg.main,
  };
}

/**
 * High-level convenience function for quick-reply buttons
 * @param socket WhatsApp socket connection
 * @param jid WhatsApp ID (user or group)
 * @param buttons Array of button configurations
 * @param body Message body text
 * @param footer Optional footer text
 */
export async function sendButtons(
  socket: Types.WASocket,
  jid: string,
  buttons: Types.Button[],
  body: string,
  footer?: string
): Promise<any> {
  const config: Types.InteractiveMessageConfig = {
    body,
    footer
  };
  
  return Buttons.sendInteractiveButtonsBasic({
    socket,
    jid,
    config,
    buttons
  });
}

// Re-export all helper functions
export const sendInteractiveButtonsBasic = Buttons.sendInteractiveButtonsBasic;
export const sendInteractiveMessage = Buttons.sendInteractiveMessage;
export const buildInteractiveButtons = Buttons.buildInteractiveButtons;
export const validateInteractiveMessage = Buttons.validateInteractiveMessage;
export const normalizeButtonFormat = Buttons.buildInteractiveButtons; // Alias
export const isValidButtonId = Buttons.isValidButtonId;
export const getButtonType = Buttons.getButtonType;

// Re-export validation types
export { InteractiveValidationError } from './types/validation.js';

// Re-export all types
export * from './types/index.js';

// Export package metadata
export { pkg as packageInfo };
export { getPackageInfo as getInfo };

// Default export
export default {
  // Helper functions
  sendButtons,
  sendInteractiveButtonsBasic,
  sendInteractiveMessage,
  buildInteractiveButtons,
  validateInteractiveMessage,
  isValidButtonId,
  getButtonType,
  
  // Error handling
  InteractiveValidationError,
  
  // Types
  ...Types,
  
  // Package metadata
  pkg: pkg,
  getPackageInfo,
  getInfo: getPackageInfo,
};