import { Router } from "express";

import authRoutes from "./auth";
import productsRoutes from "./products";
import usersRoutes from "./users";
import cartRoutes from "./cart";
import ordersRoutes from "./orders";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/products", productsRoutes);
rootRouter.use("/users", usersRoutes);
rootRouter.use("/cart", cartRoutes);
rootRouter.use("/orders", ordersRoutes);

export default rootRouter;
