export class UnauthorizedError extends Error {
  readonly status = 401;

  constructor(message = "認証が必要です。") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  readonly status = 403;

  constructor(message = "アクセス権限がありません。") {
    super(message);
    this.name = "ForbiddenError";
  }
}
