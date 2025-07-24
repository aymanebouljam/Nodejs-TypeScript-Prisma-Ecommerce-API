import { NextFunction, Request, Response } from "express";
import { AddressSchema, UpdateUserSchema } from "../schemas/users";
import { Validation } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/notFoundException";
import { AuthRequest } from "../types/authenticatedRequest";
import { BadRequestsException } from "../exceptions/badRequestsException";
import { UnAuthorizedException } from "../exceptions/unAuthorized";
import { InternalException } from "../exceptions/internalException";

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

export const listUsers = async (req: AuthRequest, res: Response) => {
  let skip = 0;
  if (!isNaN(Number(req.query.skip))) {
    skip = Number(req.query.skip);
  }
  const users = await prismaClient.user.findMany({
    skip,
    take: 5,
    select: {
      id: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
  return res.status(200).json(users);
};
export const getUserByid = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const user = await prismaClient.user.findUnique({
    where: {
      id: Number(req.params.id),
    },
    select: {
      id: true,
      name: true,
      role: true,
      createdAt: true,
      addresses: true,
    },
  });

  if (!user) {
    return next(
      new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND)
    );
  }

  return res.status(200).json(user);
};
export const changeUserRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body || !req.body.role) {
      return next(
        new Validation(
          "Role field is missing",
          ErrorCode.Unprocessable_Entity,
          null
        )
      );
    }
    const user = await prismaClient.user.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        role: req.body.role,
      },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
        addresses: true,
      },
    });
    return res.status(200).json(user);
  } catch (err: any) {
    return next(
      err instanceof NotFoundException
        ? err
        : new InternalException(
            "Somethin went wrong",
            ErrorCode.INTERNAL_EXCEPTION,
            err?.message
          )
    );
  }
};

export const listAllOrder = async (req: AuthRequest, res: Response) => {
  const skip = Number(req.query.skip) || 0;
  const orders = await prismaClient.order.findMany({
    skip,
    take: 5,
  });

  return res.status(200).json(orders);
};

export const changeStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const order = await prismaClient.order.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });

  if (!order) {
    return next(
      new NotFoundException("Order not found", ErrorCode.PRODUCT_NOT_FOUND)
    );
  }
  const updatedEvent = await prismaClient.orderEvent.create({
    data: {
      orderId: Number(req.params.id),
      status: req.body.status,
    },
  });

  return res.status(201).json({ ...order, status: updatedEvent.status });
};

export const listUserOrder = async (req: AuthRequest, res: Response) => {
  const skip = Number(req.query.skip) || 0;
  const orders = await prismaClient.order.findMany({
    where: { userId: Number(req.params.id) },
    skip,
    take: 5,
  });
  return res.status(200).json(orders);
};

export const searchProducts = async (req: AuthRequest, res: Response) => {
  const skip = Number(req.query.skip) || 0;
  const products = await prismaClient.product.findMany({
    where: {
      OR: [
        {
          name: {
            search: req.query.q?.toString(),
          },
        },
        {
          description: {
            search: req.query.q?.toString(),
          },
        },

        {
          tags: {
            search: req.query.q?.toString(),
          },
        },
      ],
    },
    skip,
    take: 5,
  });

  return res.status(200).json(products);
};
