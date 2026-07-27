export class BlogValidationError extends Error {
  constructor(message, source) {
    super(source ? `${source}: ${message}` : message);
    this.name = "BlogValidationError";
  }
}

export function assertBlog(condition, message, source) {
  if (!condition) throw new BlogValidationError(message, source);
}

export function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
