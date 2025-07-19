import { NextFunction, Request, Response } from "express";
import { ErrorCode, HttpException } from "./exceptions/root";
import { InternalException } from "./exceptions/internalException";

export const errorHandler =
  (method: Function) => (req: Request, res: Response, next: NextFunction) => {
    try {
      method(req, res, next);
    } catch (err: any) {
      let exception: HttpException;

      if (err instanceof HttpException) {
        exception = err;
      } else {
        exception = new InternalException(
          "Somethin went wrong",
          ErrorCode.INTERNAL_EXCEPTION,
          err
        );
      }

      next(exception);
    }
  };
