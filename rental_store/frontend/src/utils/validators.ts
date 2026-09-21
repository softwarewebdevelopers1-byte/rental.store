export const isEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isNonEmpty = (value: string): boolean => value.trim().length > 0;

export const isStrongEnough = (value: string): boolean => value.length >= 6;

export const isPhoneE164 = (value: string): boolean =>
  /^\+[1-9]\d{7,14}$/.test(value.trim());

export const normalizeCode = (value: string): string =>
  value.trim().toUpperCase();
