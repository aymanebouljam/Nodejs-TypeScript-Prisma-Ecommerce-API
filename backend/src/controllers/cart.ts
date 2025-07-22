import { Response } from "express";
import { AuthRequest } from "../types/authenticatedRequest";
import { CreateCartSchema } from "../schemas/cart";
import { Validation } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/notFoundException";
import { BadRequestsException } from "../exceptions/badRequestsException";
import { UnAuthorizedException } from "../exceptions/unAuthorized";


export const addItemToCart = async (req: AuthRequest, res: Response) => {
  const result = CreateCartSchema.safeParse(req.body);
  if (!result.success) {
    throw new Validation(
      "Validation failed",
      ErrorCode.Unprocessable_Entity,
      result?.error?.issues
    );
  }

  if (!req.user) {
    throw new UnAuthorizedException(
      "Unauthorized user",
      ErrorCode.UNAUTHORIZED
    );
  }

  const product = await prismaClient.product.findUnique({
    where: { id: req.body.productId },
  });

  if (!product) {
    throw new NotFoundException(
      "Product not found",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }

  const cart = await prismaClient.cartItem.findFirst({
    where: {
      productId: result.data.productId,
    },
  });

  if (cart) {
    const updatedCartItem = await prismaClient.cartItem.update({
      where: {
        id: cart.id,
      },
      data: {
        quantity: cart.quantity + result.data.quantity,
      },
    });

    return res.status(200).json(updatedCartItem);
  }

  const cartItem = await prismaClient.cartItem.create({
    data: {
      userId: req.user.id,
      productId: product.id,
      quantity: result.data.quantity,
    },
  });

  return res.status(201).json(cartItem);
};
export const deleteItemFromCart = async (req: AuthRequest, res: Response) => {
  if (!req.params.id) {
    throw new BadRequestsException("Invalid Id", ErrorCode.INVALID_CRENDETIALS);
  }

  if (!req.user) {
    throw new UnAuthorizedException(
      "Unauthorized user",
      ErrorCode.UNAUTHORIZED
    );
  }

  const CartItem = await prismaClient.cartItem.findUniqueOrThrow({
    where: {
      id: +req.params.id,
    },
  });

  if (CartItem.userId !== req.user.id) {
    throw new UnAuthorizedException(
      "Unauthorized user",
      ErrorCode.UNAUTHORIZED
    );
  }

  const deletedCartItem = await prismaClient.cartItem.delete({
    where: {
      id: +req.params.id,
    },
  });

  return res.status(200).json(deletedCartItem);
};
export const changeQuantity = async (req: AuthRequest, res: Response) => {
    
};
export const getCart = async (req: AuthRequest, res: Response) => {};
