import { Response } from "express";
import { AuthRequest } from "../types/authenticatedRequest";
import { prismaClient } from "..";
import { UnAuthorizedException } from "../exceptions/unAuthorized";
import { ErrorCode } from "../exceptions/root";

export const createOrder = async (req: AuthRequest, res: Response) => {
  if (!req.user || !req.user.id || !req.user.defaultShippingAddress) {
    throw new UnAuthorizedException(
      "Unauthorized User",
      ErrorCode.UNAUTHORIZED
    );
  }
  await prismaClient.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: { userId: req?.user?.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const price = cartItems.reduce(
      (total, item) =>
        total + Number(item.quantity) * Number(item.product.price),
      0
    );

    const address = await tx.address.findFirst({
      where: {
        id: +req.user!.defaultShippingAddress!,
      },
    });

    if (!address) {
      return res
        .status(400)
        .json({ message: "No default shipping address was set" });
    }

    const order = await tx.order.create({
      data: {
        userId: +req.user!.id!,
        netAmount: +price.toFixed(2),
        address: address?.formattedAddress,
        products: {
          create: cartItems.map((item) => {
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            };
          }),
        },
      },
    });

    const orderEvent = await tx.orderEvent.create({
      data: {
        orderId: order.id,
      },
    });

    await tx.cartItem.deleteMany({
      where: {
        userId: +req.user!.id!,
      },
    });

    return res.status(201).json({ ...order, status: orderEvent.status });
  });
};
export const ListOrders = async (req: AuthRequest, res: Response) => {};
export const cancelOrder = async (req: AuthRequest, res: Response) => {};
export const getOrderById = async (req: AuthRequest, res: Response) => {};
