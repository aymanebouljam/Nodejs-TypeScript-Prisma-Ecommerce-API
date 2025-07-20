import { z } from "zod";

export const productsSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must be at most 50 characters long" }),
  description: z
    .string()
    .min(5, { message: "Name must be at least 5 characters long" })
    .max(50, { message: "Name must be at most 50 characters long" }),
    price: z
    .number()
    .min(1, {message: "price must be greater then 0"}),
    tags: z.string(),
});
