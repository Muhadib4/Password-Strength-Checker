export type PasswordStrength = "weak" | "fair" | "good" | "strong" | "very-strong";

export type CharacterCounts = {
  lowercase: number;
  uppercase: number;
  numbers: number;
  symbols: number;
  spaces: number;
  other: number;
};

export type Requirement = {
  id: string;
  label: string;
  met: boolean;
  detail?: string;
};

export type SecurityMetric = {
  id: string;
  label: string;
  value: string;
  status: string;
  tone: "good" | "warn" | "danger" | "neutral";
  explanation: string;
};

export type PasswordAnalysis = {
  score: number;
  strength: PasswordStrength;
  label: string;
  length: number;
  counts: CharacterCounts;
  variety: number;
  entropy: number;
  patternResistance: number;
  common: boolean;
  repeated: boolean;
  hasSequence: boolean;
  hasYear: boolean;
  requirements: Requirement[];
  weaknesses: string[];
  suggestions: string[];
  metrics: SecurityMetric[];
  anatomy: Array<keyof CharacterCounts>;
  guessing: {
    strict: string;
    open: string;
    offline: string;
  };
};

export type GeneratorOptions = {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
};

export type PassphraseOptions = {
  words: number;
  separator: string;
  capitalize: boolean;
  includeNumber: boolean;
  includeSymbol: boolean;
};
