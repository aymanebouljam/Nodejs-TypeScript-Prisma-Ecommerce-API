import { NextFunction, Request, Response } from "express";
import { prismaClient } from "..";
import { hashSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { BadRequestsException } from "../exceptions/badRequestsException";
import { ErrorCode } from "../exceptions/root";
import { NotFoundException } from "../exceptions/notFoundException";
import { InvalidCrendetialsException } from "../exceptions/invalidCredentialsException";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body;

  let user = await prismaClient.user.findFirst({ where: { email } });

  if (user) {
    return next(
      new BadRequestsException(
        "User already exists!",
        ErrorCode.USER_ALREADY_EXISTS
      )
    );
  }

  user = await prismaClient.user.create({
    data: {
      name,
      email,
      password: hashSync(password, 10),
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
    return next(
      new NotFoundException("User Not Found!", ErrorCode.USER_NOT_FOUND)
    );
  }

  if (!compareSync(password, user.password)) {
    return next(
      new InvalidCrendetialsException(
        "Invalid crendetials",
        ErrorCode.INVALID_CRENDETIALS
      )
    );
  }

  if (!JWT_SECRET) {
    return new Error("JWT secret is missing in .env !");
  }

  const token = jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET
  );

  return res.status(200).json({ user, token });
};
