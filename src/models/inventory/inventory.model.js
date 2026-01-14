import mongoose from "mongoose";
const inventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  minThreshold: {
    type: Number,
    required: true
  },
  supplier: {
    type: String
  },
  requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryRequest'
  }]
}, {
  timestamps: true
});

export default mongoose.model('InventoryItem', inventoryItemSchema);
