import crypto from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const DEFAULT_PERIOD = 30;
const DEFAULT_DIGITS = 6;

export function generateMfaSecret() {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

export function buildOtpAuthUrl({ issuer, accountName, secret }) {
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(DEFAULT_DIGITS),
    period: String(DEFAULT_PERIOD),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

export function verifyMfaToken(secret, token, window = 1) {
  const normalized = normalizeToken(token);
  if (!normalized) return false;

  const now = Date.now();
  for (let offset = -window; offset <= window; offset += 1) {
    const time = now + offset * DEFAULT_PERIOD * 1000;
    if (generateTotp(secret, time) === normalized) {
      return true;
    }
  }

  return false;
}

export function normalizeToken(token) {
  if (!token) return "";
  return String(token).replace(/\s+/g, "").trim();
}

function generateTotp(secret, timestamp) {
  const key = base32Decode(secret);
  if (!key.length) return "";

  const counter = Math.floor(timestamp / 1000 / DEFAULT_PERIOD);
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buffer.writeUInt32BE(counter & 0xffffffff, 4);

  const hmac = crypto.createHmac("sha1", key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const token = (code % 10 ** DEFAULT_DIGITS).toString();
  return token.padStart(DEFAULT_DIGITS, "0");
}

function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      const index = (value >>> (bits - 5)) & 31;
      output += BASE32_ALPHABET[index];
      bits -= 5;
    }
  }

  if (bits > 0) {
    const index = (value << (5 - bits)) & 31;
    output += BASE32_ALPHABET[index];
  }

  return output;
}

function base32Decode(input) {
  if (!input) return Buffer.alloc(0);
  const cleaned = input
    .toUpperCase()
    .replace(/=+$/, "")
    .replace(/[^A-Z2-7]/g, "");

  let bits = 0;
  let value = 0;
  const output = [];

  for (const char of cleaned) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}
