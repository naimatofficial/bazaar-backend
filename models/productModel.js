import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Please provide customer id.'],
        },
        review: {
            type: String,
            required: [true, 'Please provide review.'],
        },
        rating: {
            type: Number,
            required: [true, 'Please provide rating.'],
            min: 1,
            max: 5,
            set: (val) => (Math.round(val * 10) / 10).toFixed(1),
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    { timestamps: true }
)

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide Product name'],
        },
        description: {
            type: String,
            required: [true, 'Please provide Product description'],
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Please provide Category'],
        },
        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubCategory',
        },
        subSubCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubSubCategory',
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Brand',
            required: [true, 'Please provide Brand'],
        },
        productType: {
            type: String,
            required: [true, 'Please provide Product type'],
        },
        digitalProductType: {
            type: String,
        },
        sku: {
            type: String,
            required: [true, 'Please provide SKU'],
        },
        unit: {
            type: String,
            required: [true, 'Please provide Unit'],
        },
        tags: [String],
        price: {
            type: Number,
            required: [true, 'Please provide Price'],
        },
        discount: {
            type: Number,
            discount: 0,
        },
        discountType: {
            type: String,
            enum: ['percent', 'flat'],
        },
        discountAmount: {
            type: Number,
            default: 0,
        },

        taxAmount: {
            type: Number,
            default: 0,
        },
        taxIncluded: {
            type: Boolean,
            required: [true, 'Please provide Tax inclusion status'],
        },
        shippingCost: {
            type: Number,
            default: 0,
        },
        minimumOrderQty: {
            type: Number,
            required: [true, 'Please provide Minimum order quantity'],
        },
        stock: {
            type: Number,
            required: [true, 'Please provide Stock'],
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        colors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Color',
            },
        ],
        attributes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Attribute',
            },
        ],
        thumbnail: String,
        images: [String],
        videoLink: {
            type: String,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Please provide user.'],
        },
        userType: {
            type: String,
            enum: ['vendor', 'admin'],
            required: true,
        },
        reviews: [reviewSchema],
    },
    {
        timestamps: true,
    }
)

productSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'category',
        select: 'name',
    })
        .populate({
            path: 'brand',
            select: 'name',
        })
        .populate({
            path: 'subCategory',
            select: 'name',
        })
        .populate({
            path: 'subSubCategory',
            select: 'name',
        })
    next()
})

const Product = mongoose.model('Product', productSchema)

export default Product
