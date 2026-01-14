import User from "../../models/users/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const searchUser = asyncHandler(async (req, res) => {
    const { searchQuery } = req.query;
    if (!searchQuery) {
        throw new ApiError(400, "Search Query is required")
    }
    const user = await User.find({
        $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } }
        ]
    }).select("_id name email role")
    return res.status(200).send(new ApiResponse(200, user, "User found"))
});