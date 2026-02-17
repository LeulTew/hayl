import crypto from "node:crypto";

interface TelebirrPayload {
  out_trade_no: string;
  transaction_id: string;
  state: string;
  amount: string;
  currency: string;
  sign: string;
  msisdn?: string;
}

function isTelebirrPayload(payload: unknown): payload is TelebirrPayload {
  if (!payload || typeof payload !== "object") return false;
  const candidate = payload as Record<string, unknown>;
  return (
    typeof candidate.out_trade_no === "string" &&
    typeof candidate.transaction_id === "string" &&
    typeof candidate.state === "string" &&
    typeof candidate.amount === "string" &&
    typeof candidate.currency === "string" &&
    typeof candidate.sign === "string"
  );
}

function signTelebirrPayload(payload: Record<string, unknown>, secret: string): string {
  const { sign, ...rest } = payload;

  const sortedKeys = Object.keys(rest).sort();
  const stringToSign = sortedKeys
    .filter((key) => rest[key] !== null && rest[key] !== undefined && rest[key] !== "")
    .map((key) => `${key}=${rest[key]}`)
    .join("&");

  return crypto.createHmac("sha256", secret).update(stringToSign).digest("hex");
}

function verifyTelebirrSignature(payload: TelebirrPayload, secret: string): boolean {
  const computed = signTelebirrPayload(payload, secret);
  const computedBuffer = Buffer.from(computed, "hex");
  const payloadBuffer = Buffer.from(payload.sign, "hex");

  if (computedBuffer.length !== payloadBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(computedBuffer, payloadBuffer);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ status: "error", message: "Method Not Allowed" });
    return;
  }

  const secret = process.env.TELEBIRR_SECRET;
  if (!secret) {
    res.status(500).json({ status: "error", message: "Server Misconfigured" });
    return;
  }

  if (!isTelebirrPayload(req.body)) {
    res.status(422).json({ status: "error", message: "Invalid Payload" });
    return;
  }

  if (!verifyTelebirrSignature(req.body, secret)) {
    res.status(401).json({ status: "error", message: "Invalid Signature" });
    return;
  }

  if (req.body.state === "COMPLETED") {
    console.log(`[AUDIT] Payment Success: ${req.body.transaction_id}`);
  }

  res.status(200).json({ ok: true });
}