export class LyricsError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status = 500, code = "LYRICS_ERROR") {
    super(message);
    this.name = "LyricsError";
    this.status = status;
    this.code = code;
  }
}
