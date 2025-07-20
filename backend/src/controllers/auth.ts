import { NextFunction, Request, Response } from "express";
import { prismaClient } from "..";
import { hashSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { BadRequestsException } from "../exceptions/badRequestsException";
import { ErrorCode } from "../exceptions/root";
import { NotFoundException } from "../exceptions/notFoundException";
import { InvalidCrendetialsException } from "../exceptions/invalidCredentialsException";
import { signUpSchema } from "../schemas/users";
import { Validation } from "../exceptions/validation";
import { AuthRequest } from "../types/authenticatedRequest";

export const signup = async (req: Request, res: Response) => {
  const result: any = signUpSchema.safeParse(req.body);

  if (!result.success) {
    throw new Validation(
      "Validation failed",
      ErrorCode.Unprocessable_Entity,
      result?.error?.issues
    );
  }

  const { name, email, password } = req.body;

  const isFound = await prismaClient.user.findFirst({ where: { email } });

  if (isFound) {
    throw new BadRequestsException(
      "User already exists!",
      ErrorCode.USER_ALREADY_EXISTS
    );
  }

  const user = await prismaClient.user.create({
    data: {
      name,
      email,
      password: hashSync(password, 10),
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  res.status(200).json(user);
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  let user = await prismaClient.user.findFirst({ where: { email } });

  if (!user) {
    throw new NotFoundException("User Not Found!", ErrorCode.USER_NOT_FOUND);
  }

  if (!compareSync(password, user.password)) {
    throw new InvalidCrendetialsException(
      "Invalid crendetials",
      ErrorCode.INVALID_CRENDETIALS
    );
  }

  if (!JWT_SECRET) {
    throw new Error("JWT secret is missing in .env !");
  }

  const token = jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET
  );

  const { password: _, ...publicUser } = user;

  return res.status(200).json({ publicUser, token });
};

export const me = (req: AuthRequest, res: Response) =>
  res.status(200).json(req.user);
