import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { errorHandler } from "../errorHandler";
import {
  createAddress,
  deleteAddress,
  listAddress,
  updateUser,
} from "../controllers/users";

const usersRoutes: Router = Router();

usersRoutes.post("/address", [authMiddleware], errorHandler(createAddress));
usersRoutes.delete(
  "/address/:id",
  [authMiddleware],
  errorHandler(deleteAddress)
);
usersRoutes.get("/address", [authMiddleware], errorHandler(listAddress));
usersRoutes.put("/", [authMiddleware], errorHandler(updateUser));

export default usersRoutes;
