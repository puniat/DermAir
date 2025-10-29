/**
 * Simple authentication utilities for DermAir
 * Uses browser's Web Crypto API for secure hashing
 */

/**
 * Hash a PIN using SHA-256
 * @param pin - The plain text PIN (4-6 digits)
 * @returns Promise<string> - The hashed PIN as hex string
 */
export async function hashPin(pin: string): Promise<string> {
  // Convert PIN to Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  
  // Hash using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Verify a PIN against a stored hash
 * @param pin - The plain text PIN to verify
 * @param hashedPin - The stored hashed PIN
 * @returns Promise<boolean> - True if PIN matches
 */
export async function verifyPin(pin: string, hashedPin: string): Promise<boolean> {
  const inputHash = await hashPin(pin);
  return inputHash === hashedPin;
}

/**
 * Validate PIN format (4-6 digits)
 * @param pin - The PIN to validate
 * @returns boolean - True if valid format
 */
export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}
