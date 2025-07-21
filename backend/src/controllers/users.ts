import { Request, Response } from "express";
import { AddressSchema, UpdateUserSchema } from "../schemas/users";
import { Validation } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/notFoundException";
import { AuthRequest } from "../types/authenticatedRequest";
import { BadRequestsException } from "../exceptions/badRequestsException";
import { UnAuthorizedException } from "../exceptions/unAuthorized";

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
      ErrorCode.ADDRESS_NOT_FOUND
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

export const updateUser = async (req: AuthRequest, res: Response) => {
  const result = UpdateUserSchema.safeParse(req.body);
  if (!result.success) {
    throw new Validation(
      "Validation Failed",
      ErrorCode.Unprocessable_Entity,
      result?.error?.issues
    );
  }

  const shippingAddress = await prismaClient.address.findFirst({
    where: { id: req.body?.defaultShippingAddress },
  });
  const billingAddress = await prismaClient.address.findFirst({
    where: { id: req.body?.defaultBillingAddress },
  });

  if (!shippingAddress || !billingAddress) {
    throw new NotFoundException(
      "Address Not found",
      ErrorCode.ADDRESS_NOT_FOUND
    );
  }

  if (
    !req.user ||
    req.user.id !== shippingAddress.userId ||
    req.user.id !== billingAddress.userId
  ) {
    throw new UnAuthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED);
  }

  try {
    const updatedUser = await prismaClient.user.update({
      where: { id: +req.user.id },
      data: req.body,
    });

    return res.status(200).json(updatedUser);
  } catch (err) {
    throw new BadRequestsException(
      "Failed to update user",
      ErrorCode.INVALID_CRENDETIALS
    );
  }
};
