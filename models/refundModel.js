import mongoose from 'mongoose'

const refundSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: [true, 'Please provide order Id.'],
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Refunded', 'Rejected'],
            default: 'Pending',
        },
        statusReason: {
            type: String,
        },
        reason: {
            type: String,
            required: [true, 'Please provide reason.'],
        },
        requestedAt: {
            type: Date,
            default: Date.now,
        },
        processedAt: {
            type: Date,
        },
    },
    { timestamps: true }
)

refundSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'order',
        select: '-__v -createdAt -updatedAt',
    })
    next()
})

const Refund = mongoose.model('Refund', refundSchema)

export default Refund
