import { Request, Response } from "express";
import { AddressSchema } from "../schemas/users";
import { Validation } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/notFoundException";
import { AuthRequest } from "../types/authenticatedRequest";
import { BadRequestsException } from "../exceptions/badRequestsException";

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
export const deleteAddress = async (req: Request, res: Response) => {
  if (!req.params.id) {
    throw new BadRequestsException("Invalid ID", ErrorCode.INVALID_CRENDETIALS);
  }

  try {
    const address = await prismaClient.address.delete({
      where: { id: +req.params.id },
    });
    return res.status(200).json(address);
  } catch (err) {
    throw new NotFoundException(
      "Address not found",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
};
export const listAddress = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
  }
  const addresses = await prismaClient.address.findMany({
    where: { id: req.user.id },
  });

  return res.status(200).json(addresses);
};
