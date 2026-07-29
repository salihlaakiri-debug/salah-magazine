export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_\u0600-\u06FF]{3,30}$/;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 128;

export function validateEmail(email: unknown): ValidationResult {
  if (typeof email !== "string" || !email.trim()) {
    return { valid: false, error: "البريد الإلكتروني مطلوب" };
  }
  if (!EMAIL_RE.test(email.trim())) {
    return { valid: false, error: "البريد الإلكتروني غير صالح" };
  }
  if (email.trim().length > 254) {
    return { valid: false, error: "البريد الإلكتروني طويل جداً" };
  }
  return { valid: true };
}

export function validatePassword(password: unknown): ValidationResult {
  if (typeof password !== "string" || !password) {
    return { valid: false, error: "كلمة المرور مطلوبة" };
  }
  if (password.length < PASSWORD_MIN) {
    return { valid: false, error: `كلمة المرور يجب أن تكون ${PASSWORD_MIN} أحرف على الأقل` };
  }
  if (password.length > PASSWORD_MAX) {
    return { valid: false, error: `كلمة المرور يجب أن لا تتجاوز ${PASSWORD_MAX} حرفاً` };
  }
  return { valid: true };
}

export function validateUsername(username: unknown): ValidationResult {
  if (typeof username !== "string" || !username.trim()) {
    return { valid: false, error: "اسم المستخدم مطلوب" };
  }
  if (!USERNAME_RE.test(username.trim())) {
    return { valid: false, error: "اسم المستخدم يجب أن يكون 3-30 حرفاً (أحرف، أرقام، شرطة سفلية)" };
  }
  return { valid: true };
}

export function validateName(name: unknown): ValidationResult {
  if (typeof name !== "string" || !name.trim()) {
    return { valid: false, error: "الاسم مطلوب" };
  }
  if (name.trim().length > 100) {
    return { valid: false, error: "الاسم طويل جداً" };
  }
  return { valid: true };
}

export function validateMessage(message: unknown): ValidationResult {
  if (typeof message !== "string" || !message.trim()) {
    return { valid: false, error: "الرسالة مطلوبة" };
  }
  if (message.trim().length < 10) {
    return { valid: false, error: "الرسالة قصيرة جداً (10 أحرف على الأقل)" };
  }
  if (message.trim().length > 5000) {
    return { valid: false, error: "الرسالة طويلة جداً (5000 حرف كحد أقصى)" };
  }
  return { valid: true };
}

export function validateSubject(subject: unknown): ValidationResult {
  if (typeof subject !== "string") {
    return { valid: false, error: "الموضوع غير صالح" };
  }
  if (subject.trim().length > 200) {
    return { valid: false, error: "الموضوع طويل جداً" };
  }
  return { valid: true };
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
