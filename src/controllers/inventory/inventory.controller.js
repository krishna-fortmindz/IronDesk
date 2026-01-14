import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import Inventory from "../../models/inventory/inventory.model.js";
import InventoryRequest from "../../models/inventory/inventory.request.model.js";
import mongoose from "mongoose";

const createItem = asyncHandler(async (req, res) => {
    const { name, category, quantity, minThreshold, supplier } = req.body;

    if (!name || !category || quantity === undefined || minThreshold === undefined) {
        throw new ApiError(400, "Fields name, category, quantity, and minThreshold are required");
    }

    const item = await Inventory.create({
        name,
        category,
        quantity,
        minThreshold,
        supplier,

    });

    return res.status(201).json(
        new ApiResponse(201, item, "Inventory item created successfully")
    );
});

const getAllItems = asyncHandler(async (req, res) => {
    const items = await Inventory.find();
    return res.status(200).json(
        new ApiResponse(200, items, "Inventory items fetched successfully")
    );
});

const getItemById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid item ID");
    }

    const item = await Inventory.findById(id);

    if (!item) {
        throw new ApiError(404, "Inventory item not found");
    }

    return res.status(200).json(
        new ApiResponse(200, item, "Inventory item fetched successfully")
    );
});

const updateItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, category, quantity, minThreshold, supplier } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid item ID");
    }

    const item = await Inventory.findByIdAndUpdate(
        id,
        {
            $set: {
                name,
                category,
                quantity,
                minThreshold,
                supplier
            }
        },
        { new: true }
    );

    if (!item) {
        throw new ApiError(404, "Inventory item not found");
    }

    return res.status(200).json(
        new ApiResponse(200, item, "Inventory item updated successfully")
    );
});

const assignItem = asyncHandler(async (req, res) => {
    const { itemId, employeeId, quantity, reason } = req.body;

    if (!itemId || !employeeId || !quantity || !reason) {
        throw new ApiError(400, "All fields (itemId, employeeId, quantity, reason) are required");
    }

    const item = await Inventory.findById(itemId);
    if (!item) {
        throw new ApiError(404, "Inventory item not found");
    }

    if (item.quantity < quantity) {
        throw new ApiError(400, "Insufficient stock");
    }

    // Decrement stock
    item.quantity -= quantity;
    await item.save();

    // Create transaction record
    // We import InventoryRequest dynamically or at the top if not circular. 
    // Assuming no circular dep issue since controller imports model.
    const transaction = await InventoryRequest.create({
        itemId,
        employeeId,
        requestedQty: quantity,
        reason,
        type: 'ASSIGN',
        status: 'APPROVED'
    });

    return res.status(200).json(
        new ApiResponse(200, transaction, "Item assigned successfully")
    );
});

const returnItem = asyncHandler(async (req, res) => {
    const { itemId, employeeId, quantity, reason } = req.body;

    if (!itemId || !employeeId || !quantity || !reason) {
        throw new ApiError(400, "All fields (itemId, employeeId, quantity, reason) are required");
    }

    const item = await Inventory.findById(itemId);
    if (!item) {
        throw new ApiError(404, "Inventory item not found");
    }

    // Increment stock
    item.quantity += Number(quantity);
    await item.save();

    const transaction = await InventoryRequest.create({
        itemId,
        employeeId,
        requestedQty: quantity,
        reason,
        type: 'RETURN',
        status: 'APPROVED'
    });

    return res.status(200).json(
        new ApiResponse(200, transaction, "Item returned successfully")
    );
});

const getItemHistory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid item ID");
    }

    const history = await InventoryRequest.find({ itemId: id })
        .populate("employeeId", "name email") // Assuming Employee has name/email or links to User
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, history, "Item history fetched successfully")
    );
});

export { createItem, getAllItems, getItemById, updateItem, assignItem, returnItem, getItemHistory };
