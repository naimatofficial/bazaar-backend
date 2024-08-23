import mongoose from 'mongoose'

const wishlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        totalProducts: {
            type: Number,
            required: [true, 'Total products required.'],
            default: 0,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    }
)

// Calculate total products before saving the data
wishlistSchema.pre('save', function (next) {
    this.totalProducts = this.products.length
    next()
})

wishlistSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'products',
        select: '-__v -createdAt -updatedAt',
    })
        .populate({
            path: 'user',
            select: '-__v -createdAt -updatedAt -role -status -referCode',
        })
        .lean()

    next()
})

const Wishlist = mongoose.model('Wishlist', wishlistSchema)

export default Wishlist
