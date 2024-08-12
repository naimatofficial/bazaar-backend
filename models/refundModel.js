import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Refunded', 'Rejected'],
        default: 'Pending'
    },
    statusReason: {
        type: String
    },
    reason: {
        type: String,
        required: true
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    processedAt: {
        type: Date
    }
}, { timestamps: true });

const Refund = mongoose.model('Refund', refundSchema);

export default Refund;
