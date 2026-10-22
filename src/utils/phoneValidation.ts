/**
 * Normalizes and validates Indian mobile phone numbers.
 * Supports:
 * - 10-digit numbers starting with 6, 7, 8, 9 (e.g., "9842154321")
 * - With optional country code "+91" or "91" (e.g., "+91 98421 54321", "919842154321")
 * - With optional leading 0 (e.g., "09842154321")
 * - With spaces, hyphens, or parentheses
 */
export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string; // E.164 standard: "+919842154321"
  rawDigits: string;  // 10 digits: "9842154321"
  formatted: string;  // Human display: "+91 98421 54321"
  errorEn?: string;
  errorTa?: string;
}

export function validateAndNormalizeIndianPhone(input: string): PhoneValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      normalized: '',
      rawDigits: '',
      formatted: '',
      errorEn: 'Please enter your mobile phone number.',
      errorTa: 'உங்கள் கைபேசி எண்ணை உள்ளிடவும்.',
    };
  }

  // Strip whitespace, hyphens, brackets
  let cleaned = input.trim().replace(/[\s\-\(\)\.]/g, '');

  // Handle leading +91 or 91
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  // Must now be strictly 10 numeric digits
  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      normalized: '',
      rawDigits: cleaned,
      formatted: input,
      errorEn: 'Phone number should contain digits only.',
      errorTa: 'கைபேசி எண் எண்களை மட்டுமே கொண்டிருக்க வேண்டும்.',
    };
  }

  if (cleaned.length !== 10) {
    return {
      isValid: false,
      normalized: '',
      rawDigits: cleaned,
      formatted: input,
      errorEn: `Mobile number must be 10 digits (entered ${cleaned.length} digits).`,
      errorTa: `கைபேசி எண் 10 இலக்கங்களைக் கொண்டிருக்க வேண்டும் (${cleaned.length} இலக்கங்கள் உள்ளிடப்பட்டுள்ளன).`,
    };
  }

  // Valid Indian mobile numbers start with 6, 7, 8, or 9
  if (!/^[6-9]/.test(cleaned)) {
    return {
      isValid: false,
      normalized: '',
      rawDigits: cleaned,
      formatted: input,
      errorEn: 'Valid Indian mobile numbers must start with 6, 7, 8, or 9.',
      errorTa: 'இந்திய கைபேசி எண் 6, 7, 8 அல்லது 9-ல் தொடங்க வேண்டும்.',
    };
  }

  const rawDigits = cleaned;
  const normalized = `+91${rawDigits}`;
  const formatted = `+91 ${rawDigits.slice(0, 5)} ${rawDigits.slice(5)}`;

  return {
    isValid: true,
    normalized,
    rawDigits,
    formatted,
  };
}
