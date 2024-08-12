import mongoose from 'mongoose';

const flashDealSchema = new mongoose.Schema({
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
    image: {
        type: String,
        required: true, // Ensure that an image is uploaded
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'inactive'], // Valid statuses
        default: 'inactive',
    },
    publish: {
        type: Boolean,
        default: false,
    },
    activeProducts: {
        type: Number,
        default: 0, // Initially, no products are active in the flash deal
    },
    productId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

const FlashDeal = mongoose.model('FlashDeal', flashDealSchema);

export default FlashDeal;
