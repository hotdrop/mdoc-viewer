import type { AppConfig } from "../config";
import { ForbiddenError, UnauthorizedError } from "./errors";
import { getFirebaseAuth } from "./firebaseAdmin";
import type { DecodedIdToken } from "firebase-admin/auth";

export type AuthenticatedUser = {
  uid: string;
  email: string;
  tokenIssuedAt: number;
};

export const SESSION_COOKIE_NAME = "md_doc_viewer_session";
export const SESSION_COOKIE_MAX_AGE_SECONDS = 8 * 60 * 60;
export const SESSION_COOKIE_MAX_AGE_MS =
  SESSION_COOKIE_MAX_AGE_SECONDS * 1000;

export async function verifyBearerToken(
  config: AppConfig,
  authorizationHeader: string | null,
): Promise<AuthenticatedUser> {
  if (!authorizationHeader) {
    throw new UnauthorizedError("Authorization ヘッダがありません。");
  }

  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new UnauthorizedError("Bearer トークン形式ではありません。");
  }

  const token = match[1]!.trim();
  if (!token) {
    throw new UnauthorizedError("Bearer トークンが空です。");
  }

  const auth = getFirebaseAuth(config);
  const decoded = await auth.verifyIdToken(token, true);

  return toAuthenticatedUser(config, decoded);
}

export async function createSessionCookieFromIdToken(
  config: AppConfig,
  idToken: string,
): Promise<string> {
  const token = idToken.trim();
  if (!token) {
    throw new UnauthorizedError("ID トークンが空です。");
  }

  const auth = getFirebaseAuth(config);
  const decoded = await auth.verifyIdToken(token, true);
  toAuthenticatedUser(config, decoded);
  return auth.createSessionCookie(token, {
    expiresIn: SESSION_COOKIE_MAX_AGE_MS,
  });
}

export async function verifySessionCookie(
  config: AppConfig,
  sessionCookie: string | null,
): Promise<AuthenticatedUser> {
  const token = sessionCookie?.trim();
  if (!token) {
    throw new UnauthorizedError("セッション Cookie がありません。");
  }

  const auth = getFirebaseAuth(config);
  const decoded = await auth.verifySessionCookie(token, true);
  return toAuthenticatedUser(config, decoded);
}

function toAuthenticatedUser(
  config: AppConfig,
  decoded: DecodedIdToken,
): AuthenticatedUser {
  const email = decoded.email?.trim().toLowerCase();
  const allowedDomain = config.allowedDomain.trim().toLowerCase();

  if (!email || !decoded.email_verified) {
    throw new ForbiddenError("メールアドレス未確認ユーザーです。");
  }

  if (!email.endsWith(`@${allowedDomain}`)) {
    throw new ForbiddenError("許可されたドメインではありません。");
  }

  return {
    uid: decoded.uid,
    email,
    tokenIssuedAt: decoded.iat * 1000,
  };
}
