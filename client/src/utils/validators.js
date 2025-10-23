// client/src/utils/validators.js

export const noSpaces = (v) => String(v ?? '').replace(/\s+/g, '');
export const digitsOnly = (v) => String(v ?? '').replace(/\D+/g, '');
export const trimSmart = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

export const preventInvalidNumberKey = (e) => {
  const invalid = ['e','E','+','-','.',',',' '];
  if (invalid.includes(e.key)) e.preventDefault();
};

export const sanitizePhone = (v) => {
  const s = String(v ?? '').replace(/\s+/g, '');
  if (s.startsWith('+')) return '+' + s.slice(1).replace(/\D+/g, '');
  return s.replace(/\D+/g, '');
};

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? ''));
export const isValidPhone = (phone) => /^(?:\+[1-9]\d{9,14}|\d{10,15})$/.test(sanitizePhone(phone));

export const isTimeLt = (a, b) => {
  if (!a || !b) return false;
  const [ah, am] = String(a).split(':').map(Number);
  const [bh, bm] = String(b).split(':').map(Number);
  if ([ah, am, bh, bm].some((n) => Number.isNaN(n))) return false;
  return ah * 60 + am < bh * 60 + bm;
};
