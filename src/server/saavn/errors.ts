export class SaavnError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status = 500, code = "SAAVN_ERROR") {
    super(message);
    this.name = "SaavnError";
    this.status = status;
    this.code = code;
  }
}

export class SaavnUnavailableError extends SaavnError {
  constructor(message = "The music service is currently unavailable.") {
    super(message, 503, "SAAVN_UNAVAILABLE");
    this.name = "SaavnUnavailableError";
  }
}

export class SaavnNotFoundError extends SaavnError {
  constructor(message = "The requested item was not found.") {
    super(message, 404, "SAAVN_NOT_FOUND");
    this.name = "SaavnNotFoundError";
  }
}

export class SaavnRateLimitedError extends SaavnError {
  constructor(message = "The music catalog is busy. Try again in a moment.") {
    super(message, 429, "SAAVN_RATE_LIMITED");
    this.name = "SaavnRateLimitedError";
  }
}
