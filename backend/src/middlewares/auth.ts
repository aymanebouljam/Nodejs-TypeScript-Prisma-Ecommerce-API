import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { UnAuthorizedException } from "../exceptions/unAuthorized";
import { ErrorCode } from "../exceptions/root";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/notFoundException";
import { AuthRequest } from "../types/authenticatedRequest";
import { User } from "@prisma/client";

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req?.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next(
      new UnAuthorizedException("No token provided", ErrorCode.UNAUTHORIZED)
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!JWT_SECRET) {
      throw new Error("JWT secret key is missing in .env");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await prismaClient.user.findUnique({
      where: { id: decoded?.userId },
    });

    if (!user) {
      return next(
        new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND)
      );
    }
    const { password: _, ...safeUser } = user;
    req.user = safeUser as User;

    return next();
  } catch (error) {
    return next(
      new UnAuthorizedException("Invalid token", ErrorCode.UNAUTHORIZED)
    );
  }
};
