import { createHash, randomBytes } from "crypto";

export const INVITE_EXPIRATION_DAYS = 7;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const createInviteToken = () => randomBytes(32).toString("base64url");

export const hashInviteToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const buildInviteUrl = (token: string) =>
  `${process.env.NEXTAUTH_URL}/join?token=${encodeURIComponent(token)}`;
