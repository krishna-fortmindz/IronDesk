import { Router } from "express";
import { createItem, getAllItems, getItemById, updateItem, assignItem, returnItem, getItemHistory } from "../controllers/inventory/inventory.controller.js";

const inventoryRouter = Router();

inventoryRouter.route("/create").post(createItem);
inventoryRouter.route("/").get(getAllItems);
inventoryRouter.route("/:id").get(getItemById);
inventoryRouter.route("/:id").patch(updateItem);
inventoryRouter.route("/assign").post(assignItem);
inventoryRouter.route("/return").post(returnItem);
inventoryRouter.route("/history/:id").get(getItemHistory);

export default inventoryRouter;
