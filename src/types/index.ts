// Core Baileys types
export interface WASocket {
  sendMessage: (jid: string, message: any, options?: any) => Promise<any>;
  // Add other WASocket properties as needed
}

export interface MessageContent {
  interactive?: {
    nativeFlow?: {
      buttons: any[];
      messageParams?: any;
    };
  };
}

// Button configuration interfaces
export interface BaseButton {
  id: string;
  title: string;
  subtitle?: string;
  disabled?: boolean;
}

export interface QuickReplyButton extends BaseButton {
  type: 'quick_reply';
  body?: string;
  response?: string;
}

export interface CTAUrlButton extends BaseButton {
  type: 'cta_url';
  url: string;
}

export interface CTACopyButton extends BaseButton {
  type: 'cta_copy';
  copyText: string;
}

export interface CTACallButton extends BaseButton {
  type: 'cta_call';
  phoneNumber: string;
}

export interface CTACatalogButton extends BaseButton {
  type: 'cta_catalog';
  catalogLink: string;
}

export interface CTAReminderButton extends BaseButton {
  type: 'cta_reminder';
  reminderText: string;
  dateTime: string;
}

export interface CTACancelReminderButton extends BaseButton {
  type: 'cta_cancel_reminder';
  reminderId: string;
}

export interface AddressMessageButton extends BaseButton {
  type: 'address_message';
  addressId: string;
}

export interface SendLocationButton extends BaseButton {
  type: 'send_location';
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface OpenWebViewButton extends BaseButton {
  type: 'open_webview';
  url: string;
  webviewHeight?: 'compact' | 'tall' | 'full';
}

export interface MPMButton extends BaseButton {
  type: 'mpm';
  merchantId: string;
}

export interface WAPaymentTransactionDetailsButton extends BaseButton {
  type: 'wa_payment_transaction_details';
  transactionId: string;
}

export interface AutomatedGreetingMessageViewCatalogButton extends BaseButton {
  type: 'automated_greeting_message_view_catalog';
  catalogId: string;
}

export interface GalaxyMessageButton extends BaseButton {
  type: 'galaxy_message';
  messageType: string;
  payload: any;
}

export interface SingleSelectButton extends BaseButton {
  type: 'single_select';
  options: Array<{
    id: string;
    title: string;
    description?: string;
  }>;
}

export interface ReviewAndPayButton extends BaseButton {
  type: 'review_and_pay';
  orderId: string;
  amount: number;
  currency: string;
}

export interface PaymentInfoButton extends BaseButton {
  type: 'payment_info';
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
}

export type ButtonType = 
  | 'quick_reply'
  | 'cta_url'
  | 'cta_copy'
  | 'cta_call'
  | 'cta_catalog'
  | 'cta_reminder'
  | 'cta_cancel_reminder'
  | 'address_message'
  | 'send_location'
  | 'open_webview'
  | 'mpm'
  | 'wa_payment_transaction_details'
  | 'automated_greeting_message_view_catalog'
  | 'galaxy_message'
  | 'single_select'
  | 'review_and_pay'
  | 'payment_info';

export type Button = 
  | QuickReplyButton
  | CTAUrlButton
  | CTACopyButton
  | CTACallButton
  | CTACatalogButton
  | CTAReminderButton
  | CTACancelReminderButton
  | AddressMessageButton
  | SendLocationButton
  | OpenWebViewButton
  | MPMButton
  | WAPaymentTransactionDetailsButton
  | AutomatedGreetingMessageViewCatalogButton
  | GalaxyMessageButton
  | SingleSelectButton
  | ReviewAndPayButton
  | PaymentInfoButton;

// Validation interfaces
export interface ValidationError {
  path: string;
  message: string;
  value?: any;
  expected?: any;
}

export interface ValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  example?: any;
}

// Interactive message configuration
export interface InteractiveMessageConfig {
  body: string;
  footer?: string;
  headerType?: number;
  headerText?: string;
  headerMedia?: {
    mediaType: 'image' | 'video' | 'document';
    mediaUrl: string;
    mediaCaption?: string;
  };
}

// Main function parameter interfaces
export interface SendInteractiveButtonsBasicParams {
  socket: WASocket;
  jid: string;
  config: InteractiveMessageConfig;
  buttons: Button[];
}

export interface SendInteractiveMessageParams {
  socket: WASocket;
  jid: string;
  config: InteractiveMessageConfig;
  buttons: Button[];
  format?: 'legacy' | 'current' | 'custom';
}

// Export types for all functions
export interface BaileysHelperAPI {
  sendButtons: (socket: WASocket, jid: string, buttons: Button[], body?: string, footer?: string) => Promise<any>;
  sendInteractiveMessage: (params: SendInteractiveMessageParams) => Promise<any>;
  sendInteractiveButtonsBasic: (params: SendInteractiveButtonsBasicParams) => Promise<any>;
  validateInteractiveMessage: (config: InteractiveMessageConfig, buttons: Button[]) => ValidationResult;
  buildInteractiveButtons: (buttons: Button[], format?: 'legacy' | 'current' | 'custom') => any[];
  normalizeButtonFormat: (button: any) => Button;
  isValidButtonId: (id: string) => boolean;
  getButtonType: (button: any) => ButtonType | null;
  createBinaryNode: (buttons: Button[], config: InteractiveMessageConfig) => any;
}