/**
 * Enhanced wrapper utilities to enable WhiskeySockets (Baileys fork) to send
 * WhatsApp interactive buttons / native flow messages reliably.
 * 
 * TypeScript version with full type definitions
 */

import { 
  WASocket, 
  MessageContent, 
  Button, 
  ButtonType, 
  InteractiveMessageConfig, 
  SendInteractiveButtonsBasicParams,
  SendInteractiveMessageParams,
  ValidationResult 
} from '../types/index.js';
import { InteractiveValidationError } from '../types/validation.js';

/**
 * Dynamic imports for compatibility with different Baileys versions
 */
async function importBaileysModules() {
  const modules = [];
  
  try {
    modules.push(await import('baileys'));
  } catch {}
  
  try {
    modules.push(await import('@whiskeysockets/baileys'));
  } catch {}
  
  try {
    modules.push(await import('@adiwajshing/baileys'));
  } catch {}
  
  return modules;
}

/**
 * Normalize various historical / upstream button shapes into the
 * native_flow "buttons" entry (array of { name, buttonParamsJson }).
 * 
 * Accepted input shapes:
 *  1. Already native_flow: { name: 'quick_reply', buttonParamsJson: '{...}' }
 *  2. Simple legacy:       { id: 'id1', text: 'My Button' }
 *  3. Old Baileys shape:   { buttonId: 'id1', buttonText: { displayText: 'My Button' } }
 *  4. Any other object is passed through verbatim
 * 
 * @param buttons Input raw buttons
 * @returns Array where each item has at minimum { name, buttonParamsJson }
 */
export function buildInteractiveButtons(buttons: Button[] = []): any[] {
  return buttons.map((b, i) => {
    // 1. Already full shape (trust caller)
    if (b && (b as any).name && (b as any).buttonParamsJson) return b;
    
    // 2. Simple legacy shape
    if (b && (b as any).id && (b as any).title) {
      const buttonParams = {
        id: (b as any).id,
        title: (b as any).title,
        subtitle: (b as any).subtitle || null,
        disabled: (b as any).disabled || false
      };
      
      return {
        name: getButtonType(b),
        buttonParamsJson: JSON.stringify(buttonParams)
      };
    }
    
    // 3. Old Baileys shape
    if (b && (b as any).buttonId && (b as any).buttonText) {
      const buttonParams = {
        id: (b as any).buttonId,
        title: (b as any).buttonText.displayText || (b as any).buttonText,
        subtitle: (b as any).subtitle || null,
        disabled: (b as any).disabled || false
      };
      
      return {
        name: getButtonType(b),
        buttonParamsJson: JSON.stringify(buttonParams)
      };
    }
    
    // 4. Pass through anything else
    return b;
  });
}

/**
 * Detect the button type based on button properties
 */
export function getButtonType(button: any): ButtonType {
  if (!button || typeof button !== 'object') return 'quick_reply';
  
  // Check explicit type first
  if (button.type) return button.type;
  
  // Detect based on properties
  if (button.url) return 'cta_url';
  if (button.copyText) return 'cta_copy';
  if (button.phoneNumber) return 'cta_call';
  if (button.catalogLink) return 'cta_catalog';
  if (button.reminderText) return 'cta_reminder';
  if (button.reminderId) return 'cta_cancel_reminder';
  if (button.addressId) return 'address_message';
  if (button.options) return 'single_select';
  
  // Default to quick_reply
  return 'quick_reply';
}

/**
 * Validate button ID format
 */
export function isValidButtonId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && id.length <= 64;
}

/**
 * Validate interactive message configuration
 */
export function validateInteractiveMessage(
  config: InteractiveMessageConfig, 
  buttons: Button[]
): ValidationResult {
  const errors: any[] = [];
  const warnings: any[] = [];
  
  // Validate body
  if (!config.body || typeof config.body !== 'string') {
    errors.push({
      path: 'body',
      message: 'Body text is required and must be a string',
      expected: 'string',
      value: config.body
    });
  }
  
  // Validate buttons
  if (!Array.isArray(buttons) || buttons.length === 0) {
    errors.push({
      path: 'buttons',
      message: 'At least one button is required',
      expected: 'array with minimum 1 item',
      value: buttons
    });
  }
  
  // Validate individual buttons
  buttons.forEach((button, index) => {
    if (!isValidButtonId(button.id)) {
      errors.push({
        path: `buttons[${index}].id`,
        message: 'Button ID must be a non-empty string (max 64 chars)',
        expected: 'string (1-64 chars)',
        value: button.id
      });
    }
    
    if (!button.title || typeof button.title !== 'string') {
      errors.push({
        path: `buttons[${index}].title`,
        message: 'Button title is required and must be a string',
        expected: 'string',
        value: button.title
      });
    }
    
    // Type-specific validation
    const buttonType = getButtonType(button);
    switch (buttonType) {
      case 'cta_url':
        if (!button.url || typeof button.url !== 'string') {
          errors.push({
            path: `buttons[${index}].url`,
            message: 'URL button requires a valid URL string',
            expected: 'string (URL format)',
            value: button.url
          });
        }
        break;
        
      case 'cta_call':
        if (!button.phoneNumber || !/^\+?[1-9]\d{1,14}$/.test(button.phoneNumber)) {
          errors.push({
            path: `buttons[${index}].phoneNumber`,
            message: 'Call button requires a valid phone number',
            expected: 'string (E.164 format)',
            value: button.phoneNumber
          });
        }
        break;
        
      case 'cta_copy':
        if (!button.copyText || typeof button.copyText !== 'string') {
          errors.push({
            path: `buttons[${index}].copyText`,
            message: 'Copy button requires copyText string',
            expected: 'string',
            value: button.copyText
          });
        }
        break;
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Main simplified helper for common quick-reply usage
 */
export async function sendInteractiveButtonsBasic(params: SendInteractiveButtonsBasicParams): Promise<any> {
  const { socket, jid, config, buttons } = params;
  
  // Validate input
  const validation = validateInteractiveMessage(config, buttons);
  if (!validation.isValid) {
    throw new InteractiveValidationError(
      'Invalid interactive message configuration',
      'sendInteractiveButtonsBasic',
      validation.errors,
      validation.warnings
    );
  }
  
  // Normalize buttons and build message
  const normalizedButtons = buildInteractiveButtons(buttons);
  const messageContent = buildMessageContent(config, normalizedButtons);
  
  // Send message
  return sendInteractiveMessage({
    socket,
    jid,
    config,
    buttons,
    format: 'current'
  });
}

/**
 * Lower-level power function for full control
 */
export async function sendInteractiveMessage(params: SendInteractiveMessageParams): Promise<any> {
  const { socket, jid, config, buttons, format = 'current' } = params;
  
  // Import Baileys modules dynamically for compatibility
  const baileysModules = await importBaileysModules();
  if (baileysModules.length === 0) {
    throw new Error('No Baileys module found. Please install baileys, @whiskeysockets/baileys, or @adiwajshing/baileys');
  }
  
  const baileys = baileysModules[0]; // Use first available module
  
  // Normalize buttons according to format
  const normalizedButtons = format === 'legacy' ? buttons : buildInteractiveButtons(buttons);
  
  // Build message content
  const messageContent = buildMessageContent(config, normalizedButtons);
  
  // Generate message from content
  const message = baileys.generateWAMessageFromContent(jid, messageContent, {
    ephemeralExpiration: 86400 // 24 hours
  });
  
  // Send message via relayMessage (bypasses validation)
  return await socket.relayMessage(jid, message.key, {
    additionalNodes: [message.message]
  });
}

/**
 * Build message content object
 */
function buildMessageContent(config: InteractiveMessageConfig, buttons: any[]): MessageContent {
  const messageContent: MessageContent = {
    interactive: {
      nativeFlow: {
        buttons: buttons.map(button => ({
          name: button.name,
          buttonParamsJson: button.buttonParamsJson
        })),
        messageParams: {
          body: { text: config.body }
        }
      }
    }
  };
  
  // Add optional footer
  if (config.footer) {
    messageContent.interactive!.nativeFlow!.messageParams!.footer = { text: config.footer };
  }
  
  // Add optional header
  if (config.headerText) {
    messageContent.interactive!.nativeFlow!.messageParams!.header = { 
      type: config.headerType || 1,
      text: config.headerText 
    };
  }
  
  // Add optional media
  if (config.headerMedia) {
    messageContent.interactive!.nativeFlow!.messageParams!.header = {
      type: config.headerMedia.mediaType === 'image' ? 1 : 
            config.headerMedia.mediaType === 'video' ? 2 : 3,
      text: config.headerText || '',
      media: {
        url: config.headerMedia.mediaUrl,
        caption: config.headerMedia.mediaCaption || ''
      }
    };
  }
  
  return messageContent;
}