# BaileysHelper TypeScript

Enhanced WhiskeySockets Interactive Buttons with full TypeScript support

[![npm version](https://img.shields.io/npm/v/baileys-helper.svg)](https://www.npmjs.com/package/baileys-helper)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

This repository provides enhanced WhatsApp interactive buttons functionality for WhiskeySockets (Baileys fork) with comprehensive TypeScript type definitions. The functionality is packaged and published as the npm package `baileys-helper` which reproduces the binary node structure the official client emits so buttons render correctly for both private & group chats.

## Problem Statement

By default, WhiskeySockets cannot send interactive buttons while itsukichan can. The root cause is that WhiskeySockets lacks the required binary node wrappers (`biz`, `interactive`, `native_flow`) that WhatsApp expects for interactive messages.

## Solution

The enhanced functionality provided by the `baileys-helper` package provides the missing functionality by:

1. **Detecting button messages** using the same logic as itsukichan
2. **Converting** WhiskeySockets' `interactiveButtons` format to the proper protobuf structure
3. **Adding missing binary nodes** (`biz`, `interactive`, `native_flow`, `bot`) via `additionalNodes`
4. **Automatically handling** private vs group chat requirements
5. **Full TypeScript support** with comprehensive type definitions

## Key Features

- ✅ **No modifications** to WhiskeySockets or itsukichan folders
- ✅ **Full TypeScript Support** with 100% type coverage
- ✅ **Template functionality removed** as requested
- ✅ **Automatic binary node injection** for button messages
- ✅ **Private chat support** (adds `bot` node with `biz_bot: '1'`)
- ✅ **Group chat support** (adds only `biz` node)
- ✅ **Backward compatibility** (regular messages pass through unchanged)
- ✅ **Comprehensive Error Handling** with detailed validation
- ✅ **17+ Button Types** including quick replies, CTAs, location, payments
- ✅ **Dynamic Baileys Compatibility** (supports multiple Baileys versions)

## Installation

### For TypeScript Projects

```bash
npm install baileys-helper @types/node
# or
yarn add baileys-helper @types/node
```

### For JavaScript Projects

```bash
npm install baileys-helper
# or
yarn add baileys-helper
```

## Quick Start

### TypeScript Usage

```typescript
import { sendButtons, Button } from 'baileys-helper';

// Define your buttons with full type safety
const buttons: Button[] = [
  {
    id: 'accept',
    title: 'Accept',
    type: 'quick_reply'
  },
  {
    id: 'website',
    title: 'Visit Website',
    type: 'cta_url',
    url: 'https://example.com'
  }
];

await sendButtons(
  socket,
  '1234567890@s.whatsapp.net',
  buttons,
  'Do you accept the terms and conditions?',
  'Please choose an option below'
);
```

### JavaScript Usage

```javascript
const { sendButtons } = require('baileys-helper');

const buttons = [
  { id: 'accept', title: 'Accept', type: 'quick_reply' },
  { id: 'website', title: 'Visit Website', type: 'cta_url', url: 'https://example.com' }
];

await sendButtons(
  socket,
  '1234567890@s.whatsapp.net',
  buttons,
  'Do you accept the terms and conditions?',
  'Please choose an option below'
);
```

## Button Types

This package supports 17+ different WhatsApp interactive button types:

### Basic Buttons
- **Quick Reply** - Simple response buttons
- **CTA URL** - Buttons that open websites
- **CTA Copy** - Buttons that copy text to clipboard
- **CTA Call** - Buttons that initiate phone calls

### Advanced Buttons
- **Single Select** - In-button picker lists
- **Send Location** - Location sharing buttons
- **Open WebView** - Embedded web view buttons

### Payment & Commerce
- **Review & Pay** - Payment processing buttons
- **Payment Info** - Payment status buttons
- **CTA Catalog** - Product catalog buttons
- **MPM** - Merchant payment buttons
- **WA Payment Transaction** - Transaction details

### Special Purpose
- **Reminder** - Schedule reminder buttons
- **Cancel Reminder** - Remove scheduled reminders
- **Address Message** - Address selection buttons
- **Galaxy Message** - Specialized message types
- **Automated Greeting** - Auto-catalog greetings

## Core Functions

### `sendButtons(socket, jid, buttons, body, footer?)`

High-level convenience function for quick-reply buttons.

```typescript
import { sendButtons, Button } from 'baileys-helper';

const buttons: Button[] = [
  { id: 'opt1', title: 'Option 1', type: 'quick_reply' },
  { id: 'opt2', title: 'Option 2', type: 'quick_reply' }
];

await sendButtons(
  socket,
  '1234567890@s.whatsapp.net',
  buttons,
  'Choose an option:'
);
```

### `sendInteractiveButtonsBasic(params)`

Simplified wrapper for quick-reply buttons with full configuration control.

```typescript
import { 
  sendInteractiveButtonsBasic, 
  Button, 
  InteractiveMessageConfig 
} from 'baileys-helper';

const params = {
  socket,
  jid: '1234567890@s.whatsapp.net',
  config: {
    body: 'Choose your preferred option',
    footer: 'Select one below',
    headerType: 1,
    headerText: 'Menu Selection',
    headerMedia: {
      mediaType: 'image',
      mediaUrl: 'https://example.com/menu.jpg',
      mediaCaption: 'Choose wisely!'
    }
  },
  buttons: [
    {
      id: 'menu1',
      title: 'Option 1',
      type: 'quick_reply'
    },
    {
      id: 'menu2',
      title: 'Option 2',
      type: 'quick_reply'
    }
  ]
};

await sendInteractiveButtonsBasic(params);
```

### `sendInteractiveMessage(params)`

Low-level power function for full control over button configuration.

```typescript
import { 
  sendInteractiveMessage, 
  Button, 
  InteractiveMessageConfig 
} from 'baileys-helper';

const buttons: Button[] = [
  {
    id: 'visit',
    title: 'Visit Website',
    type: 'cta_url',
    url: 'https://example.com'
  },
  {
    id: 'call',
    title: 'Call Support',
    type: 'cta_call',
    phoneNumber: '+1234567890'
  },
  {
    id: 'copy_id',
    title: 'Copy Order ID',
    type: 'cta_copy',
    copyText: 'ORDER-12345'
  }
];

await sendInteractiveMessage({
  socket,
  jid: '1234567890@s.whatsapp.net',
  config: {
    body: 'Need help with your order?',
    footer: 'Our support team is here to help',
    headerText: 'Customer Support',
    headerType: 1
  },
  buttons,
  format: 'current' // 'legacy', 'current', or 'custom'
});
```

## Validation & Error Handling

### Interactive Validation

All functions include comprehensive validation with detailed error reporting:

```typescript
import { validateInteractiveMessage, InteractiveValidationError } from 'baileys-helper';

try {
  const validation = validateInteractiveMessage(config, buttons);
  if (!validation.isValid) {
    console.error('Validation errors:', validation.errors);
    console.error('Warnings:', validation.warnings);
  }
} catch (error) {
  if (error instanceof InteractiveValidationError) {
    console.log('Detailed error format:');
    console.log(error.formatDetailed());
    
    // Or get JSON format for API responses
    console.log('JSON format:', error.toJSON());
  }
}
```

### Common Validation Errors

The validation system catches:
- Missing or invalid button IDs
- Empty or invalid body text
- Type-specific button validation (URLs, phone numbers, etc.)
- Button count limits
- Missing required fields for specific button types

## Type Definitions

### Core Types

```typescript
import { 
  Button,           // Union type for all button types
  WASocket,         // Baileys socket interface
  InteractiveMessageConfig, // Message configuration
  ValidationResult  // Validation result interface
} from 'baileys-helper';
```

### Button Type Interfaces

```typescript
// Individual button interfaces are available
import { 
  QuickReplyButton,
  CTAUrlButton,
  CTACopyButton,
  CTACallButton,
  SendLocationButton,
  SingleSelectButton
  // ... and more
} from 'baileys-helper';
```

## Utility Functions

### `buildInteractiveButtons(buttons)`

Normalize buttons from multiple legacy formats into the current native_flow format.

```typescript
import { buildInteractiveButtons } from 'baileys-helper';

const rawButtons = [
  { id: '1', title: 'Button 1' },           // Legacy format
  { id: '2', title: 'Button 2', url: 'https://example.com' },
  { 
    buttonId: '3', 
    buttonText: { displayText: 'Button 3' }  // Old Baileys format
  }
];

const normalizedButtons = buildInteractiveButtons(rawButtons);
```

### `getButtonType(button)`

Detect the button type based on button properties.

```typescript
import { getButtonType } from 'baileys-helper';

const button = { id: '1', title: 'Test', url: 'https://example.com' };
const type = getButtonType(button); // Returns: 'cta_url'
```

### `isValidButtonId(id)`

Validate button ID format.

```typescript
import { isValidButtonId } from 'baileys-helper';

console.log(isValidButtonId('valid_id')); // true
console.log(isValidButtonId(''));         // false
console.log(isValidButtonId(null));       // false
```

## Migration from JavaScript to TypeScript

### Automatic Type Inference

If you're already using `baileys-helper` in JavaScript, TypeScript will automatically infer types:

```javascript
// JavaScript
const { sendButtons } = require('baileys-helper');
// TypeScript will infer: sendButtons(socket: WASocket, jid: string, buttons: Button[], body: string, footer?: string) => Promise<any>
```

### Gradual Type Adoption

1. **Install TypeScript dependencies:**
   ```bash
   npm install --save-dev typescript @types/node
   ```

2. **Rename files to `.ts`:** Your existing JavaScript code will work immediately with type inference.

3. **Add explicit types gradually:**
   ```typescript
   import { sendButtons, Button } from 'baileys-helper';
   
   const buttons: Button[] = [
     { id: '1', title: 'Button 1', type: 'quick_reply' }
   ];
   ```

## API Reference

For complete API documentation, see [`docs/typescript-api-documentation.md`](docs/typescript-api-documentation.md).

## Examples

For comprehensive examples, see:
- [`examples/typescript-examples.ts`](examples/typescript-examples.ts) - TypeScript examples
- [`examples/test-all-types.ts`](examples/test-all-types.ts) - Type system validation tests

## Building from Source

```bash
git clone https://github.com/your-org/baileys-helper-typescript.git
cd baileys-helper-typescript
npm install
npm run build
```

### Build Scripts

- `npm run build` - Build JavaScript and TypeScript declarations
- `npm run build:js` - Build JavaScript files only
- `npm run build:types` - Build TypeScript declarations only
- `npm run build:watch` - Watch mode for development
- `npm run type-check` - Check TypeScript types without building
- `npm run clean` - Clean build artifacts

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Original BaileysHelper by [mehebub648](https://github.com/mehebub648/Scratchive-Module-BaileysHelper)
- WhiskeySockets/Baileys community for the foundation
- TypeScript community for excellent type system patterns