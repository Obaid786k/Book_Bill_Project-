// src/utils/errorMessages.js

/**
 * Bill Book Central Error Map
 * Maps Supabase Auth, PostgreSQL SQLSTATE, PostgREST, and Network codes to:
 * { message: string, field?: string, surface: 'inline' | 'toast' | 'banner' | 'redirect-login' | 'redirect-list' }
 */
export const ERROR_MAP = {
  // --- Auth Errors ---
  invalid_credentials: {
    message: "We couldn't sign you in. Double-check your email and password.",
    surface: "inline",
  },
  email_not_confirmed: {
    message: "Please verify your email first — check your inbox for the confirmation link.",
    surface: "inline",
  },
  email_exists: {
    message: "An account with this email already exists.",
    surface: "inline",
  },
  user_already_exists: {
    message: "An account with this email already exists.",
    surface: "inline",
  },
  weak_password: {
    message: "Password must be at least 6 characters with uppercase, lowercase, a number and a symbol.",
    field: "password",
    surface: "inline",
  },
  same_password: {
    message: "Your new password must be different from your current one.",
    field: "password",
    surface: "inline",
  },
  email_address_invalid: {
    message: "That email address doesn't look valid.",
    field: "email",
    surface: "inline",
  },
  over_email_send_rate_limit: {
    message: "You've requested this a few times. Please wait a minute before trying again.",
    surface: "inline",
  },
  over_request_rate_limit: {
    message: "Too many attempts. Please wait a moment and try again.",
    surface: "toast",
  },
  session_expired: {
    message: "Your session has expired. Please log in again.",
    surface: "redirect-login",
  },
  session_not_found: {
    message: "Your session has expired. Please log in again.",
    surface: "redirect-login",
  },
  refresh_token_not_found: {
    message: "You've been signed out for security. Please log in again.",
    surface: "redirect-login",
  },
  refresh_token_already_used: {
    message: "You've been signed out for security. Please log in again.",
    surface: "redirect-login",
  },
  user_banned: {
    message: "Your account access has been restricted. Contact support if you believe this is a mistake.",
    surface: "inline",
  },
  user_not_found: {
    message: "We couldn't find your account. Please log in again.",
    surface: "redirect-login",
  },
  signup_disabled: {
    message: "New sign-ups are temporarily paused. Please check back soon.",
    surface: "inline",
  },
  validation_failed: {
    message: "Something went wrong on our end. Please try again.",
    surface: "toast",
  },
  bad_json: {
    message: "Something went wrong on our end. Please try again.",
    surface: "toast",
  },
  request_timeout: {
    message: "This is taking longer than expected. Please check your connection and try again.",
    surface: "toast",
  },
  unexpected_failure: {
    message: "We're having trouble completing this request right now. Please try again in a moment.",
    surface: "toast",
  },
  not_implemented: {
    message: "This sign-in method isn't available right now.",
    surface: "toast",
  },

  // --- Auth Token / Link Lifecycle (Phase AUTH-1) ---
  otp_expired: {
    message: "This link has expired or has already been used. For your security, links can only be used once.",
    surface: "inline",
  },
  access_denied: {
    message: "This link is no longer valid. Please request a new one.",
    surface: "inline",
  },

  // --- Database / PostgREST Errors ---
  42501: {
    message: "We couldn't save this — please try again. If this keeps happening, please log out and back in.",
    surface: "toast",
  },
  PGRST301: {
    message: "This item isn't available or doesn't exist.",
    surface: "redirect-list",
  },
  23505: {
    message: "This value is already in use. Please use a different one.",
    surface: "inline",
  },
  23503: {
    message: "This item is linked to something that no longer exists. Please refresh and try again.",
    surface: "toast",
  },
  23502: {
    message: "Please fill in all required fields before saving.",
    surface: "inline",
  },
  "22P02": {
    message: "One of the values entered isn't valid. Please check the amount fields and try again.",
    surface: "inline",
  },
  "42P01": {
    message: "Something went wrong loading this page. Please try again shortly.",
    surface: "toast",
  },
  PGRST116: {
    message: "This item may have been deleted or moved. Redirecting you back to the list.",
    surface: "redirect-list",
  },
  PGRST204: {
    message: "Something went wrong loading this data. Please refresh and try again.",
    surface: "toast",
  },
  "08006": {
    message: "We're reconnecting — please try again in a few seconds.",
    surface: "toast",
  },
  "08003": {
    message: "We're reconnecting — please try again in a few seconds.",
    surface: "toast",
  },

  // --- Storage Errors ---
  403: {
    message: "We couldn't upload this file. Please try again.",
    surface: "toast",
  },
  413: {
    message: "This file is too large. Please use an image under 5MB.",
    surface: "inline",
  },

  // --- Fallback ---
  DEFAULT: {
    message: "Something went wrong. Please try again.",
    surface: "toast",
  },
};

const BB_ERRORS = {
  BB_INVOICE_SEQ_MALFORMED: "Your invoice number format is not valid. Fix it in Settings → Invoice Preferences (e.g. INV-0001).",
  BB_NO_ITEMS: "Add at least one item before saving.",
  BB_ITEM_INVALID: "An item has an invalid value. Check name, quantity, rate, discount (0–100) and GST (0–100).",
  BB_BILL_NOT_FOUND: "This invoice no longer exists.",
  BB_BILL_CANCELLED: "This invoice is cancelled and can't be changed.",
  BB_NOT_OWNER: "We couldn't find your business. Please log out and log in again.",
};

/**
 * Returns a user-friendly error object from any raw error.
 */
export function getFriendlyError(error) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      message: "You're offline. Your changes are safe — we'll save them once you're back online.",
      surface: "banner",
    };
  }

  if (!error) return ERROR_MAP.DEFAULT;

  const rawMessage = error.message || (typeof error === 'string' ? error : '');
  const lowerMsg = rawMessage.toLowerCase();

  // Check network failures
  if (lowerMsg.includes('failed to fetch') || lowerMsg.includes('networkerror')) {
    return {
      message: "You're offline. Your changes are safe — we'll save them once you're back online.",
      surface: "banner",
    };
  }

  // Extract code
  let code = error.code || error.error_code;

  // Check URL hash/auth error strings if no direct code
  if (!code) {
    if (lowerMsg.includes('otp_expired') || lowerMsg.includes('token has expired') || lowerMsg.includes('token is expired')) {
      code = 'otp_expired';
    } else if (lowerMsg.includes('access_denied') || lowerMsg.includes('token is invalid') || lowerMsg.includes('invalid link')) {
      code = 'access_denied';
    } else if (lowerMsg.includes('invalid login credentials') || lowerMsg.includes('invalid credentials')) {
      code = 'invalid_credentials';
    } else if (lowerMsg.includes('email not confirmed')) {
      code = 'email_not_confirmed';
    } else if (lowerMsg.includes('already registered') || lowerMsg.includes('user already exists')) {
      code = 'user_already_exists';
    } else if (lowerMsg.includes('rate limit') || lowerMsg.includes('too many requests')) {
      code = 'over_request_rate_limit';
    } else if (lowerMsg.includes('jwt expired') || lowerMsg.includes('session expired')) {
      code = 'session_expired';
    }
  }

  // Special refinement for unique constraint violation (23505)
  if (code === '23505' || code === 23505) {
    const details = (error.details || '').toLowerCase() + ' ' + lowerMsg;
    if (details.includes('invoice_no') || details.includes('bills_business_invoice_no_unique')) {
      return {
        message: "This invoice number is already used. Change 'Next Invoice Number' in Settings → Invoice Preferences.",
        field: "invoiceNo",
        surface: "inline",
      };
    }
    return ERROR_MAP['23505'];
  }

  // Errors raised by our own database functions (0007): "BB_<CODE>: details"
  if (code === 'P0001') {
    const reason = rawMessage.split(':')[0].trim();
    if (BB_ERRORS[reason]) return { message: BB_ERRORS[reason], surface: 'toast', reason };
  }

  const mapped = ERROR_MAP[code];
  if (mapped) return mapped;

  // If error has a readable safe message from our app, use it with default surface
  return ERROR_MAP.DEFAULT;
}
