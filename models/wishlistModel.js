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
    },
    { timestamps: true }
)

wishlistSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'products',
        select: '-__v -createdAt -updatedAt',
    }).populate({
        path: 'user',
        select: '-__v -createdAt -updatedAt -role -status -referCode',
    })
    next()
})

const Wishlist = mongoose.model('Wishlist', wishlistSchema)

export default Wishlist
