import type { AppConfig } from "../config";
import { ForbiddenError, UnauthorizedError } from "./errors";
import { getFirebaseAuth } from "./firebaseAdmin";

export type AuthenticatedUser = {
  uid: string;
  email: string;
  tokenIssuedAt: number;
};

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

  if (!decoded.email || !decoded.email_verified) {
    throw new ForbiddenError("メールアドレス未確認ユーザーです。");
  }

  if (!decoded.email.endsWith(`@${config.allowedDomain}`)) {
    throw new ForbiddenError("許可されたドメインではありません。");
  }

  return {
    uid: decoded.uid,
    email: decoded.email,
    tokenIssuedAt: decoded.iat * 1000,
  };
}
