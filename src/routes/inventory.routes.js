import { Router } from "express";
import { createItem, getAllItems, getItemById, updateItem, assignItem, returnItem, getItemHistory, getLowStockItems, deleteItem } from "../controllers/inventory/inventory.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleGuard } from "../middlewares/role.middleware.js";

const inventoryRouter = Router();

inventoryRouter.route("/")
    .post(verifyJWT, roleGuard("ADMIN", "HR"), createItem)
    .get(verifyJWT, getAllItems);

inventoryRouter.route("/low-stock")
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getLowStockItems);

inventoryRouter.route("/assign")
    .post(verifyJWT, roleGuard("ADMIN", "HR"), assignItem);

inventoryRouter.route("/return")
    .post(verifyJWT, roleGuard("ADMIN", "HR"), returnItem);

inventoryRouter.route("/history/:id")
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getItemHistory);

inventoryRouter.route("/:id")
    .get(verifyJWT, getItemById)
    .patch(verifyJWT, roleGuard("ADMIN", "HR"), updateItem)
    .delete(verifyJWT, roleGuard("ADMIN"), deleteItem);

export default inventoryRouter;
