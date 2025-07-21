import { ErrorCode, HttpException } from "./root";

export class UnAuthorizedException extends HttpException {
  constructor(message: string, errorCode: ErrorCode) {
    super(message, errorCode, 401, null);
  }
}
