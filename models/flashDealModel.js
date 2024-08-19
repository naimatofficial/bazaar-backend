import mongoose from 'mongoose'

const flashDealSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide title.'],
        },
        image: {
            type: String,
            required: [true, 'Please provide image.'],
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        startDate: {
            type: Date,
            required: [true, 'Please provide start date.'],
        },
        endDate: {
            type: Date,
            required: [true, 'Please provide end date.'],
        },

        status: {
            type: String,
            enum: ['active', 'expired', 'inactive'],
            default: 'inactive',
        },
        publish: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    }
)

const FlashDeal = mongoose.model('FlashDeal', flashDealSchema)

// Add a virtual field to calculate the total number of products
flashDealSchema.virtual('activeProducts').get(function () {
    return this.products.length
})

flashDealSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'products',
        select: 'thumbnail name userId price',
    })
    next()
})

export default FlashDeal
