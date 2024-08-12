import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const vendorSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

  shopName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ['pending', 'active','rejected'],
    default: 'pending',
  },
  vendorImage: {
    type: String,
  },
  logo: {
    type: String,
  },
  banner: {
    type: String,
  },
  role: {
    type: String,
    default: "vendor",
  },
});

export default model('Vendor', vendorSchema);
