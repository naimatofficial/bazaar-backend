import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'

const addressSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    address: {
        type: String,
    },
    phone: {
        type: String,
    },
})

const customerSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'Please tell us your name.'],
        },
        lastName: {
            type: String,
        },
        email: {
            type: String,
            required: [true, 'Please provide your email address.'],
            unique: true,
            lowercase: true,
            validate: [
                validator.isEmail,
                'Please provide a valid email address.',
            ],
        },
        phoneNumber: {
            type: String,
            unique: true,
        },
        image: {
            type: String,
        },
        role: {
            type: String,
            enum: ['customer'],
            default: 'customer',
        },
        referCode: {
            type: String,
        },
        password: {
            type: String,
            required: [true, 'Please provide a password.'],
            minlength: 8,
            select: false,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        permanentAddress: addressSchema,
        officeShippingAddress: addressSchema,
        officeBillingAddress: addressSchema,
    },
    {
        timestamps: true,
    }
)

customerSchema.methods.correctPassword = async function (
    candidatePassword,
    customerPassword
) {
    return await bcrypt.compare(candidatePassword, customerPassword)
}

customerSchema.pre('save', async function (next) {
    // Only work when the password is not modified
    if (!this.isModified('password')) return next()

    // Hash the password using cost of 12
    this.password = await bcrypt.hash(this.password, 12)

    next()
})

// if customer deleted, also Delete all the related reveiws to the customer
customerSchema.post('findByIdAndDelete', async function (doc) {
    if (doc) {
        await mongoose.model('Review').deleteMany({ customer: doc._id })
    }
})

const Customer = mongoose.model('Customer', customerSchema)

export default Customer
