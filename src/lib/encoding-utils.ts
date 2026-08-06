export interface JwtDecoded {
  header: Record<string, any>;
  payload: Record<string, any>;
  signature: string;
  rawHeader: string;
  rawPayload: string;
}

export function decodeJwtPart(part: string): Record<string, any> {
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const jsonStr = decodeURIComponent(
    atob(padded)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonStr);
}

export function decodeJwt(token: string): JwtDecoded {
  const clean = token.trim();
  const parts = clean.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT token structure. A JWT must consist of 3 dot-separated parts (header.payload.signature).");
  }

  const header = decodeJwtPart(parts[0]);
  const payload = decodeJwtPart(parts[1]);

  return {
    header,
    payload,
    signature: parts[2],
    rawHeader: parts[0],
    rawPayload: parts[1],
  };
}

export async function verifyJwtHmacSignature(
  token: string,
  secret: string
): Promise<boolean> {
  if (!token || !secret) return false;
  const parts = token.trim().split(".");
  if (parts.length !== 3) return false;

  const header = decodeJwtPart(parts[0]);
  const alg = header.alg;

  let hashName = "SHA-256";
  if (alg === "HS384") hashName = "SHA-384";
  if (alg === "HS512") hashName = "SHA-512";
  if (alg !== "HS256" && alg !== "HS384" && alg !== "HS512") {
    throw new Error(`Algorithm ${alg} is not supported for secret verification. Only HS256, HS384, and HS512 are supported.`);
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const dataToSign = encoder.encode(`${parts[0]}.${parts[1]}`);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: { name: hashName } },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, dataToSign);

  // Convert buffer to base64url
  const sigArray = Array.from(new Uint8Array(signatureBuffer));
  const base64Sig = btoa(String.fromCharCode(...sigArray))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return base64Sig === parts[2];
}
