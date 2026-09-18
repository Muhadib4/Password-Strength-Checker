import { PASSPHRASE_WORDS } from "./wordlist";
import type { GeneratorOptions, PassphraseOptions } from "./types";

const AMBIGUOUS = new Set(["O", "0", "I", "l", "1"]);

function secureRandomInt(max: number): number {
  if (!Number.isFinite(max) || max <= 0) return 0;
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) throw new Error("Web Crypto is unavailable in this browser.");
  const maxUint = 0xffffffff;
  const limit = maxUint - (maxUint % max);
  const buffer = new Uint32Array(1);
  do {
    cryptoApi.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % max;
}

function shuffle<T>(items: T[]): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomInt(index + 1);
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

function filterAmbiguous(value: string, excludeAmbiguous: boolean): string {
  return excludeAmbiguous ? Array.from(value).filter((char) => !AMBIGUOUS.has(char)).join("") : value;
}

export function generatePassword(options: GeneratorOptions): string {
  const groups: string[] = [];
  if (options.lowercase) groups.push(filterAmbiguous("abcdefghijklmnopqrstuvwxyz", options.excludeAmbiguous));
  if (options.uppercase) groups.push(filterAmbiguous("ABCDEFGHIJKLMNOPQRSTUVWXYZ", options.excludeAmbiguous));
  if (options.numbers) groups.push(filterAmbiguous("0123456789", options.excludeAmbiguous));
  if (options.symbols) groups.push("!@#$%^&*+-_=~?/");
  if (!groups.length) return "";

  const chars = groups.map((group) => group[secureRandomInt(group.length)]);
  const pool = groups.join("");
  while (chars.length < options.length) chars.push(pool[secureRandomInt(pool.length)]);
  return shuffle(chars).join("");
}

export function generatePassphrase(options: PassphraseOptions): string {
  const words = Array.from({ length: Math.max(3, Math.min(8, options.words)) }, () => {
    const word = PASSPHRASE_WORDS[secureRandomInt(PASSPHRASE_WORDS.length)];
    return options.capitalize ? `${word[0].toUpperCase()}${word.slice(1)}` : word;
  });
  let result = words.join(options.separator || "-");
  if (options.includeNumber) result += `${options.separator || "-"}${secureRandomInt(10)}`;
  if (options.includeSymbol) {
    const symbols = "!@#$%&*";
    result += `${options.separator || "-"}${symbols[secureRandomInt(symbols.length)]}`;
  }
  return result;
}
