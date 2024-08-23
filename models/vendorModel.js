import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import validator from 'validator'

const vendorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please tell us your first name.'],
        trim: true,
    },
    lastName: {
        type: String,
        default: '',
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please tell us your phone number.'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide your email address.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email address.'],
    },
    password: {
        type: String,
        required: [true, 'Please provide password.'],
        minlength: 8,
        select: false,
    },
    shopName: {
        type: String,
        required: [true, 'Please tell us shop name.'],
        trim: true,
    },
    address: {
        type: String,
        required: [true, 'Please provide your address.'],
        trim: true,
    },

    status: {
        type: String,
        enum: ['pending', 'active', 'rejected'],
        default: 'pending',
    },
    vendorImage: {
        type: String,
    },
    logo: {
        type: String,
    },
    banner: {
        type: String,
    },
    role: {
        type: String,
        default: 'vendor',
    },
})

vendorSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

vendorSchema.pre('save', async function (next) {
    // Only work when the password is not modified
    if (!this.isModified('password')) return next()

    // Hash the password using cost of 12
    this.password = await bcrypt.hash(this.password, 12)

    next()
})

const Vendor = mongoose.model('Vendor', vendorSchema)

export default Vendor
