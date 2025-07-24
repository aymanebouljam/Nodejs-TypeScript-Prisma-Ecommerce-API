import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { errorHandler } from "../errorHandler";
import {
  cancelOrder,
  createOrder,
  getOrderById,
  ListOrders,
} from "../controllers/orderds";

const ordersRoutes: Router = Router();

ordersRoutes.post("/", [authMiddleware], errorHandler(createOrder));
ordersRoutes.get("/", [authMiddleware], errorHandler(ListOrders));
ordersRoutes.put("/:id/cancel", [authMiddleware], errorHandler(cancelOrder));
ordersRoutes.get("/:id", [authMiddleware], errorHandler(getOrderById));

export default ordersRoutes;
