import { z } from "zod";

export const CreateCartSchema = z.object({
  productId: z.number(),
  quantity: z.number(),
});

export const UpdateCartQuantitySchema = z.object({
  quantity: z.number(),
});
