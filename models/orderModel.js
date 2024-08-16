import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Please provide customer.'],
        },
        vendors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Vendor',
                required: [true, 'Please provide vendor.'],
            },
        ],
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: [true, 'Please provide product.'],
            },
        ],
        orderStatus: {
            type: String,
            enum: [
                'pending',
                'confirmed',
                'packaging',
                'out_for_delivery',
                'delivered',
                'failed_to_deliver',
                'returned',
                'canceled',
            ],
            default: 'pending',
        },
        totalAmount: {
            type: Number,
            required: [true, 'Please provide total amount.'],
        },
        paymentMethod: {
            type: String,
            enum: [
                'credit_card',
                'paypal',
                'bank_transfer',
                'cash_on_delivery',
            ],
            required: true,
        },
        shippingAddress: {
            type: {
                address: String,
                city: String,
                state: String,
                zipCode: String,
                country: String,
            },
            required: [true, 'Please provide shipping address.'],
        },
        billingAddress: {
            type: {
                address: String,
                city: String,
                state: String,
                zipCode: String,
                country: String,
            },
            required: [true, 'Please provide billing address.'],
        },
        orderNote: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

orderSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'vendors',
        select: '-__v -createdAt -updatedAt -role -status',
    })
        .populate({
            path: 'products',
            select: '-__v -createdAt -updatedAt',
        })
        .populate({
            path: 'customer',
            select: '-__v -createdAt -updatedAt -role -status -referCode',
        })
    next()
})

const Order = mongoose.model('Order', orderSchema)

export default Order
