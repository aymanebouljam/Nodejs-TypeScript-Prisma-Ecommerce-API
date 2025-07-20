import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/authenticatedRequest";
import { UnAuthorizedException } from "../exceptions/unAuthorized";
import { ErrorCode } from "../exceptions/root";
import { Role } from "../types/role.enum";

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== Role.ADMIN) {
    return next(
      new UnAuthorizedException(
        "Unauthorized user",
        ErrorCode.UNAUTHORIZED,
        null
      )
    );
  }

  next();
};
