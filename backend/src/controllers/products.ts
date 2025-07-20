import { Request, Response } from "express";
import { prismaClient } from "..";
import { productsSchema } from "../schemas/products";
import { Validation } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { InternalException } from "../exceptions/internalException";

export const createProduct = async (req: Request, res: Response) => {
  const result = productsSchema.safeParse({
    ...req.body,
    price: Number(req.body?.price),
    tags: req.body?.tags.join(","),
  });
  if (!result.success) {
    throw new Validation(
      "Validation failed",
      ErrorCode.Unprocessable_Entity,
      result?.error?.issues
    );
  }
  const product = await prismaClient.product.create({
    data: {
      ...req.body,
      price: Number(req.body?.price),
      tags: req.body.tags.join(","),
    },
  });

  if (!product) {
    throw new InternalException(
      "Something went wrong",
      ErrorCode.INTERNAL_EXCEPTION,
      null
    );
  }

  return res.status(201).json(product);
};
