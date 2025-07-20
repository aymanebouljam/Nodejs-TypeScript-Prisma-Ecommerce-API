import { Request, Response } from "express";
import { prismaClient } from "..";
import { productsSchema } from "../schemas/products";
import { Validation } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { InternalException } from "../exceptions/internalException";
import { NotFoundException } from "../exceptions/notFoundException";

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

export const updateProduct = async (req: Request, res: Response) => {
  try {
    if (req.body.tags) {
      req.body.tags = req.body.tags.join(",");
    }

    const updatedProduct = await prismaClient.product.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });

    return res.status(200).json(updatedProduct);
  } catch (err) {
    throw new NotFoundException(
      "Product not found",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const deletedProduct = await prismaClient.product.delete({
      where: { id: +req.params.id },
    });

    return res.status(200).json({
      ...deletedProduct,
      deletedAt: new Date(Date.now()).toISOString(),
    });
  } catch (err) {
    throw new NotFoundException(
      "Product Not found",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
};

export const listProducts = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;

  const skip = (page - 1) * limit;

  const count = await prismaClient.product.count();
  const products = await prismaClient.product.findMany({
    skip,
    take: limit,
  });

  return res
    .status(200)
    .json({ total: count, page, perPage: limit, data: products });
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prismaClient.product.findFirstOrThrow({
      where: { id: +req.params.id },
    });

    return res.status(200).json(product);
  } catch (err) {
    throw new NotFoundException(
      "Product not found",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
};
