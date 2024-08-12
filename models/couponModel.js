
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const couponSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required.'],
  },
  code: {
    type: String,
    required: [true, 'Code is required.'],
    unique: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['Discount on Purchase', 'Free Delivery', 'Buy One Get One', 'Others'],
    required: [true, 'Type is required.'],
  },
 
  userLimit: {
    limit: {
      type: Number,
      required: [true, 'Limit is required.'],
      min: [0, 'Limit cannot be negative.'],
    },
    used: {
      type: Number,
      default: 0,
      min: [0, 'Used count cannot be negative.'],
    },
  },
  discountBearer: {
    type: String,
    enum: ['Vendor', 'Customer', 'Admin'],
    required: [true, 'Discount Bearer is required.'],
  },
  discountType: {
    type: String,
    enum: ['Amount', 'Percentage'],
    required: [true, 'Discount Type is required.'],
  },
  discountAmount: {
    type: Number,
    required: [true, 'Discount Amount is required.'],
    min: [0, 'Discount Amount cannot be negative.'],
  },
  minPurchase: {
    type: Number,
    required: [true, 'Minimum Purchase is required.'],
    min: [0, 'Minimum Purchase cannot be negative.'],
  },
  maxDiscount: {
    type: Number,
    required: [true, 'Maximum Discount is required.'],
    min: [0, 'Maximum Discount cannot be negative.'],
  },
  startDate: {
    type: Date,
    required: [true, 'Start Date is required.'],
  },
  expireDate: {
    type: Date,
    required: [true, 'Expire Date is required.'],
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  applicableProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  applicableVendors: [{
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
  }],
  applicableCustomers: [{
    type: Schema.Types.ObjectId,
    ref: 'Customer',
  }],
}, {
  timestamps: true, 
});

const Coupon = model('Coupon', couponSchema);

export default Coupon;
