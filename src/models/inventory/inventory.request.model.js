import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const inventoryRequestSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  requestedQty: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['ASSIGN', 'RETURN', 'ADJUSTMENT'],
    default: 'ASSIGN',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'APPROVED' // Auto-approved for now as logic handles stock
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.model('InventoryRequest', inventoryRequestSchema);
