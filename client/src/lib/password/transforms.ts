export type TransformMethod = "shift-1" | "shift-2" | "shift-minus-1" | "shift-minus-2" | "rot13" | "atbash" | "reverse" | "base64";
export type TransformMode = "encode" | "decode";

const METHODS: Record<TransformMethod, { label: string; description: string }> = {
  "shift-1": { label: "Caesar +1", description: "Huruf digeser maju satu posisi." },
  "shift-2": { label: "Caesar +2", description: "Huruf digeser maju dua posisi." },
  "shift-minus-1": { label: "Caesar −1", description: "Huruf digeser mundur satu posisi." },
  "shift-minus-2": { label: "Caesar −2", description: "Huruf digeser mundur dua posisi." },
  rot13: { label: "ROT13", description: "Substitusi alfabet dengan rotasi 13 posisi." },
  atbash: { label: "Atbash", description: "A ↔ Z dan a ↔ z." },
  reverse: { label: "Reverse", description: "Urutan karakter dibalik." },
  base64: { label: "Base64", description: "Representasi teks, bukan enkripsi." },
};

export const transformMethods = Object.entries(METHODS).map(([value, data]) => ({ value: value as TransformMethod, ...data }));

function shiftChar(char: string, amount: number): string {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + amount + 26) % 26) + 65);
  if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + amount + 26) % 26) + 97);
  if (code >= 48 && code <= 57) return String.fromCharCode(((code - 48 + amount + 10) % 10) + 48);
  return char;
}

function shiftText(value: string, amount: number): string {
  return Array.from(value).map((char) => shiftChar(char, amount)).join("");
}

function atbash(value: string): string {
  return Array.from(value).map((char) => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCharCode(90 - (code - 65));
    if (code >= 97 && code <= 122) return String.fromCharCode(122 - (code - 97));
    if (code >= 48 && code <= 57) return String.fromCharCode(57 - (code - 48));
    return char;
  }).join("");
}

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function decodeBase64(value: string): string {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function transformPassword(value: string, method: TransformMethod, mode: TransformMode): string {
  if (!value) return "";
  const reverseDirection = mode === "decode" ? -1 : 1;
  try {
    switch (method) {
      case "shift-1": return shiftText(value, reverseDirection);
      case "shift-2": return shiftText(value, 2 * reverseDirection);
      case "shift-minus-1": return shiftText(value, -1 * reverseDirection);
      case "shift-minus-2": return shiftText(value, -2 * reverseDirection);
      case "rot13": return shiftText(value, 13);
      case "atbash": return atbash(value);
      case "reverse": return Array.from(value).reverse().join("");
      case "base64": return mode === "encode" ? encodeBase64(value) : decodeBase64(value);
    }
  } catch {
    return "Format tidak valid untuk decode metode ini.";
  }
}
