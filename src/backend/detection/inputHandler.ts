export function normalizeText(input: string): string {
  // Remove extra whitespace, normalize unicode, lowercase
  return input.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function validateText(input: string): boolean {
  // Check if input is non-empty and reasonable length
  return typeof input === 'string' && input.length > 0 && input.length < 10000;
}