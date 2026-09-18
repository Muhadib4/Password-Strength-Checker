import type {
  CharacterCounts,
  PasswordAnalysis,
  PasswordStrength,
  SecurityMetric,
} from "./types";

const COMMON_PASSWORDS = new Set([
  "123456", "password", "123456789", "qwerty", "12345678", "12345", "111111", "1234567",
  "admin", "letmein", "welcome", "monkey", "dragon", "football", "iloveyou", "princess",
  "abc123", "password1", "password123", "qwerty123", "admin123", "admin@123", "p@ssw0rd",
  "passw0rd", "summer2026", "summer2025", "welcome1", "trustno1", "login", "master",
]);

const COMMON_WORDS = [
  "password", "welcome", "admin", "summer", "winter", "spring", "autumn", "qwerty", "letmein",
  "monkey", "dragon", "football", "secret", "hello", "love", "sunshine", "family", "office",
  "shadow", "computer", "baseball", "princess", "freedom", "purple", "whatever", "starwars",
];

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890"];

function countCharacters(password: string): CharacterCounts {
  const counts: CharacterCounts = { lowercase: 0, uppercase: 0, numbers: 0, symbols: 0, spaces: 0, other: 0 };
  Array.from(password).forEach((char) => {
    if (/[a-z]/i.test(char) && char === char.toLowerCase()) counts.lowercase += 1;
    else if (/[a-z]/i.test(char) && char === char.toUpperCase()) counts.uppercase += 1;
    else if (/[0-9]/.test(char)) counts.numbers += 1;
    else if (/\s/.test(char)) counts.spaces += 1;
    else if (char.toLowerCase() !== char.toUpperCase()) counts.other += 1;
    else counts.symbols += 1;
  });
  return counts;
}

function hasSequentialRun(password: string): boolean {
  const normalized = password.toLowerCase();
  for (let index = 0; index < normalized.length - 2; index += 1) {
    const chunk = normalized.slice(index, index + 3);
    const codes = Array.from(chunk).map((char) => char.charCodeAt(0));
    const ascending = codes.every((code, i) => i === 0 || code === codes[i - 1] + 1);
    const descending = codes.every((code, i) => i === 0 || code === codes[i - 1] - 1);
    if (ascending || descending) return true;
  }
  return false;
}

function hasKeyboardPattern(password: string): boolean {
  const normalized = password.toLowerCase();
  return KEYBOARD_ROWS.some((row) => {
    for (let index = 0; index < row.length - 2; index += 1) {
      const chunk = row.slice(index, index + 3);
      if (normalized.includes(chunk) || normalized.includes(Array.from(chunk).reverse().join(""))) return true;
    }
    return false;
  });
}

function hasRepeatedSubstring(password: string): boolean {
  const normalized = password.toLowerCase();
  for (let size = 2; size <= Math.min(5, Math.floor(normalized.length / 2)); size += 1) {
    for (let index = 0; index <= normalized.length - size * 2; index += 1) {
      const part = normalized.slice(index, index + size);
      if (normalized.slice(index + size).includes(part)) return true;
    }
  }
  return /(.)\1{2,}/.test(password);
}

function findYear(password: string): boolean {
  return /(?:19\d{2}|20\d{2})/.test(password);
}

function hasCommonStructure(password: string): boolean {
  const normalized = password.toLowerCase().replace(/[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]/g, "");
  return COMMON_WORDS.some((word) => normalized.includes(word));
}

function estimateEntropy(password: string, counts: CharacterCounts): number {
  if (!password) return 0;
  let pool = 0;
  if (counts.lowercase) pool += 26;
  if (counts.uppercase) pool += 26;
  if (counts.numbers) pool += 10;
  if (counts.symbols) pool += 33;
  if (counts.spaces) pool += 1;
  if (counts.other) pool += 100;
  const base = password.length * Math.log2(Math.max(pool, 1));
  const uniqueRatio = new Set(Array.from(password)).size / password.length;
  return Math.max(0, Math.round(base * (0.62 + uniqueRatio * 0.38)));
}

function strengthFor(score: number): { strength: PasswordStrength; label: string } {
  if (score < 20) return { strength: "weak", label: "Weak" };
  if (score < 40) return { strength: "fair", label: "Fair" };
  if (score < 60) return { strength: "good", label: "Good" };
  if (score < 80) return { strength: "strong", label: "Strong" };
  return { strength: "very-strong", label: "Very strong" };
}

function formatEstimate(score: number, factor: number): string {
  const effective = score * factor;
  if (effective < 12) return "Instant";
  if (effective < 22) return "Seconds";
  if (effective < 32) return "Minutes";
  if (effective < 43) return "Hours";
  if (effective < 55) return "Days";
  if (effective < 70) return "Years";
  return "Centuries+";
}

function metric(
  id: string,
  label: string,
  value: string,
  status: string,
  tone: SecurityMetric["tone"],
  explanation: string,
): SecurityMetric {
  return { id, label, value, status, tone, explanation };
}

export function analyzePassword(password: string): PasswordAnalysis {
  const counts = countCharacters(password);
  const length = [...password].length;
  const uniqueCount = new Set([...password]).size;
  const variety = Math.min(100, Math.round(([
    counts.lowercase > 0,
    counts.uppercase > 0,
    counts.numbers > 0,
    counts.symbols > 0,
    counts.spaces > 0 || counts.other > 0,
  ].filter(Boolean).length / 5) * 100));
  const entropy = estimateEntropy(password, counts);
  const common = COMMON_PASSWORDS.has(password.toLowerCase()) || hasCommonStructure(password);
  const hasSequence = hasSequentialRun(password) || hasKeyboardPattern(password);
  const repeated = hasRepeatedSubstring(password);
  const hasYear = findYear(password);
  const longEnough = length >= 12;
  const veryLong = length >= 16;

  let score = 0;
  score += Math.min(42, length * 3.3);
  score += Math.min(22, entropy * 0.27);
  score += variety * 0.18;
  score += Math.min(8, uniqueCount * 0.45);
  if (veryLong) score += 8;
  else if (longEnough) score += 4;
  if (common) score -= 35;
  if (hasCommonStructure(password)) score -= 18;
  if (hasSequence) score -= 18;
  if (repeated) score -= 15;
  if (hasYear) score -= 12;
  if (counts.numbers === length || counts.lowercase === length) score -= 8;
  if (length < 8) score -= 22;
  else if (length < 12) score -= 10;
  score = password ? Math.max(2, Math.min(100, Math.round(score))) : 0;

  const { strength, label } = strengthFor(score);
  const patternResistance = Math.max(0, Math.min(100, Math.round(score - (common ? 22 : 0) - (hasSequence ? 18 : 0) - (repeated ? 15 : 0))));
  const weaknesses: string[] = [];
  const suggestions: string[] = [];
  if (length < 12) {
    weaknesses.push("Too short to provide strong resistance against guessing.");
    suggestions.push("Add more length instead of simply adding another symbol.");
  }
  if (common || hasCommonStructure(password)) {
    weaknesses.push("Contains a commonly used password structure or word.");
    suggestions.push("Avoid common words, names, and familiar password templates.");
  }
  if (hasSequence) {
    weaknesses.push(hasKeyboardPattern(password) ? "Uses a common keyboard pattern." : "Contains a predictable character sequence.");
    suggestions.push("Remove repeated or sequential characters.");
  }
  if (repeated) {
    weaknesses.push("Contains repeated characters or repeated substrings.");
    suggestions.push("Use unrelated characters or words instead of repeating a pattern.");
  }
  if (hasYear) {
    weaknesses.push("Contains a predictable year or date pattern.");
    suggestions.push("Avoid appending a year to a familiar word.");
  }
  if (!counts.uppercase || !counts.lowercase || !counts.numbers || !counts.symbols) {
    suggestions.push("Mix character types when it helps, but prioritize unique length first.");
  }
  if (!password) suggestions.length = 0;

  const requirements = [
    { id: "length", label: "At least 12 characters", met: length >= 12 },
    { id: "recommended", label: "16+ characters recommended", met: length >= 16 },
    { id: "lowercase", label: "Contains lowercase letters", met: counts.lowercase > 0 },
    { id: "uppercase", label: "Contains uppercase letters", met: counts.uppercase > 0 },
    { id: "numbers", label: "Contains numbers", met: counts.numbers > 0 },
    { id: "symbols", label: "Contains symbols", met: counts.symbols > 0 },
    { id: "sequence", label: "Avoids obvious sequences", met: !hasSequence },
    { id: "repeat", label: "Avoids repeated patterns", met: !repeated },
    { id: "common", label: "Not a common password", met: !common },
    { id: "year", label: "No obvious year/date pattern", met: !hasYear },
  ];

  const metrics: SecurityMetric[] = [
    metric("length", "Password length", password ? `${length} chars` : "—", length >= 16 ? "Excellent" : length >= 12 ? "Solid" : "Build up", length >= 16 ? "good" : length >= 12 ? "warn" : "danger", "Longer passwords create more room for unpredictability."),
    metric("variety", "Character variety", password ? `${Math.round(variety)}%` : "—", variety >= 80 ? "High" : variety >= 40 ? "Mixed" : "Limited", variety >= 80 ? "good" : variety >= 40 ? "warn" : "danger", "Different character families widen the search space."),
    metric("entropy", "Entropy estimate", password ? `~${entropy} bits` : "—", entropy >= 70 ? "High" : entropy >= 45 ? "Medium" : "Low", entropy >= 70 ? "good" : entropy >= 45 ? "warn" : "danger", "A rough estimate, not a complete security verdict."),
    metric("patterns", "Pattern resistance", password ? `${patternResistance}/100` : "—", patternResistance >= 75 ? "High" : patternResistance >= 45 ? "Medium" : "Low", patternResistance >= 75 ? "good" : patternResistance >= 45 ? "warn" : "danger", "Penalizes sequences, repeats, and familiar structures."),
    metric("common", "Common password check", password ? (common ? "Detected" : "Clear") : "—", common ? "Review" : "Clear", common ? "danger" : "good", "Checks a bundled local list and common word structures."),
    metric("repeat", "Repeat resistance", password ? (repeated ? "Pattern found" : "Clean") : "—", repeated ? "Review" : "Clean", repeated ? "warn" : "good", "Looks for repeated characters and substrings."),
  ];

  const anatomy: Array<keyof CharacterCounts> = [];
  for (const char of password) {
    if (/\p{Ll}/u.test(char)) anatomy.push("lowercase");
    else if (/\p{Lu}/u.test(char)) anatomy.push("uppercase");
    else if (/\p{N}/u.test(char)) anatomy.push("numbers");
    else if (/\s/u.test(char)) anatomy.push("spaces");
    else if (/\p{L}/u.test(char)) anatomy.push("other");
    else anatomy.push("symbols");
  }

  return {
    score,
    strength,
    label,
    length,
    counts,
    variety,
    entropy,
    patternResistance,
    common,
    repeated,
    hasSequence,
    hasYear,
    requirements,
    weaknesses,
    suggestions: [...new Set(suggestions)].slice(0, 4),
    metrics,
    anatomy,
    guessing: {
      strict: formatEstimate(score, 0.5),
      open: formatEstimate(score, 0.8),
      offline: formatEstimate(score, 1.35),
    },
  };
}
