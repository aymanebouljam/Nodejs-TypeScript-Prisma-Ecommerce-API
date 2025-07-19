import { ErrorCode, HttpException } from "./root";

export class InvalidCrendetialsException extends HttpException {
  constructor(message: string, errorCode: ErrorCode) {
    super(message, errorCode, 403, null);
  }
}
