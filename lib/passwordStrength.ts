/**
 * Password strength scoring utility.
 * Used by both frontend (Register / ResetPassword) and backend (register API).
 */

export interface PasswordStrength {
  /** 0 = blank, 1 = weak, 2 = fair, 3 = good, 4 = strong */
  score: number;
  label: "None" | "Weak" | "Fair" | "Good" | "Strong";
  color: string;
  suggestions: string[];
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: "None", color: "#4b5563", suggestions: ["Enter a password"] };
  }

  const suggestions: string[] = [];
  let score = 0;

  // Length checks
  if (password.length >= 8) score++;
  else suggestions.push("At least 8 characters");

  if (password.length >= 12) score++;

  // Character variety
  if (/[A-Z]/.test(password)) score++;
  else suggestions.push("Add an uppercase letter");

  if (/[a-z]/.test(password)) score++;
  else suggestions.push("Add a lowercase letter");

  if (/[0-9]/.test(password)) score++;
  else suggestions.push("Add a number");

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else suggestions.push("Add a special character (!@#$...)");

  // Normalize to 1–4 scale
  let finalScore: number;
  if (score <= 2) finalScore = 1;
  else if (score <= 3) finalScore = 2;
  else if (score <= 4) finalScore = 3;
  else finalScore = 4;

  const labels: Record<number, PasswordStrength["label"]> = {
    1: "Weak",
    2: "Fair",
    3: "Good",
    4: "Strong",
  };

  const colors: Record<number, string> = {
    1: "#ef4444", // red
    2: "#f59e0b", // amber
    3: "#3b82f6", // blue
    4: "#22c55e", // green
  };

  return {
    score: finalScore,
    label: labels[finalScore],
    color: colors[finalScore],
    suggestions,
  };
}

/**
 * Returns true if password meets minimum requirements for registration.
 * Requires at least "Fair" (score >= 2): 8+ chars with some variety.
 */
export function isPasswordAcceptable(password: string): boolean {
  return evaluatePasswordStrength(password).score >= 2;
}
