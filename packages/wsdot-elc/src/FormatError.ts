/**
 * An error that is thrown when a string is not in the expected format.
 */
export default class FormatError extends Error {
  public value: string;
  public expectedFormat: RegExp | null;
  constructor(value: string, expectedFormat?: RegExp) {
    let message = `Not in expected format: "${value}".`;
    if (expectedFormat) {
      message += ` Expected format: ${expectedFormat}`;
    }
    super(message);
    this.value = value;
    this.expectedFormat = expectedFormat || null;
  }
}
