export default class LogicError extends Error {
  constructor({
    status = 500,
    message = 'Unknown client error',
    errorCode
  } = {}) {
    super(message);
    this.status = status;
    this.message = message;
    this.errorCode = errorCode;
  }

  set errorCode(errorCode) {
    this.errorCode = errorCode;
  }
}
