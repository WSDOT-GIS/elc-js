/**
 * An error that is thrown when a string is not in the expected format.
 */
export default class FormatError extends Error {
  /**
   * The value that was not in the expected format.
   */
  public value: string;
  /**
   * The expected format for the input value.
   */
  public expectedFormat: RegExp | null;
  /**
   * Constructor for creating an instance of {@link FormatError}.
   *
   * @param {string} value - The value that was not in the expected format.
   * @param {RegExp} [expectedFormat] - The expected format for the input value.
   */
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
