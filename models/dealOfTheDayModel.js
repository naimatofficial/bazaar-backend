import mongoose from 'mongoose';

const dealOfTheDaySchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    status: {
        type: String,
        enum: ['active', 'expired', 'inactive'], // Valid statuses
        default: 'inactive',
    },
}, { timestamps: true });

const DealOfTheDay = mongoose.model('DealOfTheDay', dealOfTheDaySchema);

export default DealOfTheDay;
