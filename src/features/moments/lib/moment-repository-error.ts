const MISSING_TABLE_ERROR_CODE = "PGRST205";

export class MomentRepositoryError extends Error {
  constructor(
    message: string,
    readonly code: string
  ) {
    super(message);
    this.name = "MomentRepositoryError";
  }
}

export function isMomentsSchemaMissing(error: unknown) {
  return (
    error instanceof MomentRepositoryError &&
    error.code === MISSING_TABLE_ERROR_CODE
  );
}
