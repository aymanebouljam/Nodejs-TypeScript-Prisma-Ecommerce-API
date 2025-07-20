import { NextFunction, Request, Response } from "express";
import { HttpException } from "../exceptions/root";

export const errorMiddleware = (
  err: HttpException | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? "Internal Server Error";
  const errorCode = err.errorCode ?? "UNKNOWN_ERROR";
  const errors = err.errors ?? "";

  return res.status(statusCode).json({
    message,
    errorCode,
    errors,
  });
};
