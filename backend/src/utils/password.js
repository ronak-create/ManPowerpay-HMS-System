import ApiError from './ApiError.js';

// Minimum policy: 8+ chars with at least one lowercase, uppercase, digit, and symbol.
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const PASSWORD_POLICY_MESSAGE =
  'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol.';

export function isStrongPassword(password) {
  return typeof password === 'string' && PASSWORD_RE.test(password);
}

// Throws a 400 ApiError if the password does not meet the policy.
export function assertStrongPassword(password) {
  if (!isStrongPassword(password)) {
    throw new ApiError(400, PASSWORD_POLICY_MESSAGE);
  }
}

// Generate a random password that satisfies the policy (for temp employee passwords).
export function generateTempPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*';
  const all = upper + lower + digits + symbols;
  const pick = (set) => set[Math.floor(Math.random() * set.length)];
  // Guarantee one of each class, then fill to length 12.
  let chars = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  while (chars.length < 12) chars.push(pick(all));
  // Fisher–Yates shuffle so the guaranteed chars aren't always in front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
