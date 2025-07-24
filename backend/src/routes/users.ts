import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { errorHandler } from "../errorHandler";
import {
  changeUserRole,
  createAddress,
  deleteAddress,
  getUserByid,
  listAddress,
  listUsers,
  updateUser,
} from "../controllers/users";
import { adminMiddleware } from "../middlewares/admin";

const usersRoutes: Router = Router();

usersRoutes.post("/address", [authMiddleware], errorHandler(createAddress));
usersRoutes.delete(
  "/address/:id",
  [authMiddleware],
  errorHandler(deleteAddress)
);
usersRoutes.get("/address", [authMiddleware], errorHandler(listAddress));
usersRoutes.put("/", [authMiddleware], errorHandler(updateUser));
usersRoutes.get("/", [authMiddleware], errorHandler(listUsers));
usersRoutes.get(
  "/:id",
  [authMiddleware, adminMiddleware],
  errorHandler(getUserByid)
);
usersRoutes.put(
  "/:id/role",
  [authMiddleware, adminMiddleware],
  errorHandler(changeUserRole)
);

export default usersRoutes;
