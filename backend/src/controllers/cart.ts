import { Response } from "express";
import { AuthRequest } from "../types/authenticatedRequest";
import { CreateCartSchema } from "../schemas/cart";
import { Validation } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/notFoundException";

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
    throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
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

  const cartItem = await prismaClient.cartItem.create({
    data: {
      userId: req.user.id,
      productId: product.id,
      quantity: result.data.quantity,
    },
  });

  return res.status(201).json(cartItem);
};
export const deleteItemFromCart = async (req: AuthRequest, res: Response) => {};
export const changeQuantity = async (req: AuthRequest, res: Response) => {};
export const getCart = async (req: AuthRequest, res: Response) => {};
