import { Request, Response } from "express";
import { AddressSchema } from "../schemas/users";
import { Validation } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/notFoundException";
import { AuthRequest } from "../types/authenticatedRequest";

export const createAddress = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
  }

  req.body.userId = +req.user.id;

  const result = AddressSchema.safeParse(req.body);
  if (!result.success) {
    throw new Validation(
      "Validation failed",
      ErrorCode.Unprocessable_Entity,
      result?.error?.issues
    );
  } else {
    const address = await prismaClient.address.create({
      data: {
        ...req.body,
      },
    });

    return res.status(201).json(address);
  }
};
export const deleteAddress = (req: Request, res: Response) => {};
export const listAddress = (req: Request, res: Response) => {};
