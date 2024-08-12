// models/FeatureDeal.js

import mongoose from 'mongoose';

const featureDealSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'inactive',
    },
    productIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    activeProducts: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

const FeatureDeal = mongoose.model('FeatureDeal', featureDealSchema);
export default FeatureDeal;
