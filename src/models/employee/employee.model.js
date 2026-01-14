import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  designation: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  shift: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
