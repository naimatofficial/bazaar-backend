import User from '../models/userModel.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from './../utils/appError.js'

import { loginService } from '../services/authService.js'
import Vendor from '../models/vendorModel.js'
import Customer from '../models/customerModel.js'
import { getCacheKey } from '../utils/helpers.js'
import redisClient from '../config/redisConfig.js'
import { checkFields } from './handleFactory.js'

const createSendToken = catchAsync(async (user, statusCode, res) => {
    // loginService is Redis database to store the token in cache
    const { accessToken } = await loginService(user)

    // set cookie options
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    }

    // In production mode: we set to secure = true
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

    // do not show the password to client side
    user.password = undefined

    console.log(user)

    res.cookie('jwt', accessToken, cookieOptions)

    res.status(statusCode).json({
        status: 'success',
        accessToken,
        user,
    })
})

export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    // 1) Check if email and password exists
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400))
    }

    // 2) Check the user exists && password is correct
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }

    // 3) If everything is Ok, then send the response to client
    createSendToken(user, 200, res)
})

export const signup = catchAsync(async (req, res, next) => {
    const data = checkFields(User, req, next)

    console.log(data)

    const { name, email, password } = data

    const newUser = await User.create({
        name,
        email,
        password,
    })

    console.log(newUser)

    // delete pervious cache
    const cacheKey = getCacheKey(User, '', req.query)
    await redisClient.del(cacheKey)

    createSendToken(newUser, 201, res)
})

export const logout = catchAsync(async (req, res, next) => {
    const user = req.user

    // Clear the refreshToken cookie on the client
    res.clearCookie('jwt')

    res.status(200).json({
        status: 'success',
        message: 'Logout successfully',
    })
})
export const loginCustomer = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    // 1) Check if email and password exists
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400))
    }

    // 2) Check the user exists && password is correct
    const user = await Customer.findOne({ email }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }

    // 3) If everything is Ok, then send the response to client
    createSendToken(user, 200, res)
})

export const signupCustomer = catchAsync(async (req, res, next) => {
    // const data = checkFields(Customer, req, next)

    console.log(req.body)

    const { firstName, lastName, email, password } = req.body

    const newCustomer = new Customer({
        firstName,
        lastName,
        email,
        password,
    })

    await newCustomer.save()

    // delete pervious cache
    const cacheKey = getCacheKey(Customer, '', req.query)
    await redisClient.del(cacheKey)

    createSendToken(newCustomer, 201, res)
})

export const loginVendor = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    // 1) Check if email and password exists
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400))
    }

    // 2) Check the vendor exists && password is correct
    const vendor = await Vendor.findOne({ email }).select('+password')

    if (!vendor || !(await vendor.correctPassword(password, vendor.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }

    // 3) If everything is Ok, then send the response to client
    createSendToken(vendor, 200, res)
})

export const VendorSignup = catchAsync(async (req, res, next) => {
    const data = checkFields(Vendor, req, next)
    const newVendor = await Vendor.create(data)

    // delete pervious cache
    const cacheKey = getCacheKey(Vendor, '', req.query)
    await redisClient.del(cacheKey)

    createSendToken(newVendor, 201, res)
})

// exports.forgotPassword = catchAsync(async (req, res, next) => {
// 	// 1) Get user based on posted email
// 	const user = await User.findOne({ email: req.body.email });
// 	if (!user) {
// 		return next(new App("There is no user with email address.", 404));
// 	}

// 	// 2) Generate the random token
// 	const resetToken = user.createPasswordResetToken();
// 	await user.save({ validateBeforeSave: false });

// 	// 3) Send it to user's email
// 	try {
// 		const resetURL = `${req.protocol}://${req.get(
// 			"host"
// 		)}/api/v1/users/resetPassword/${resetToken}`;

// 		const message = `Forgot your password? Submit a Patch request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email!`;

// 		await sendEmail({
// 			email: user.email,
// 			subject: "Your password reset token (valid for 10 min)!",
// 			message,
// 		});

// 		res.status(200).json({
// 			status: "success",
// 			message: "Token successfully sent to email!",
// 		});
// 	} catch (error) {
// 		user.passwordResetExpires = undefined;
// 		user.passwordResetToken = undefined;
// 		await user.save({ validateBeforeSave: false });

// 		next(
// 			new AppError(
// 				"There was an error sending the email, Please try again latter!",
// 				500
// 			)
// 		);
// 	}
// });

// exports.resetPassword = catchAsync(async (req, res, next) => {
// 	// 1) Create a hashedToken
// 	const hashedToken = crypto
// 		.createHash("sha256")
// 		.update(req.params.token)
// 		.digest("hex");

// 	// 2) Check the user exists and also check password reset expires is greater then current time
// 	const user = await User.findOne({
// 		passwordResetToken: hashedToken,
// 		passwordResetExpires: { $gt: Date.now() },
// 	});

// 	if (!user) {
// 		return next(new AppError("Token is invalid or has expired", 400));
// 	}

// 	// 3) Update the user properties & remove the unnecessary fields
// 	user.password = req.body.password;
// 	user.passwordConfirm = req.body.passwordConfirm;
// 	user.passwordResetToken = undefined;
// 	user.passwordResetExpires = undefined;
// 	await user.save();

// 	createSendToken(user, 200, res);
// });

// exports.updatePassword = catchAsync(async (req, res, next) => {
// 	// 1) Check the user in Collection
// 	const user = await User.findById(req.user.id).select("+password");

// 	// 2) Check the Posted current password is correct
// 	const correct = await user.correctPassword(
// 		req.body.passwordCurrent,
// 		user.password
// 	);

// 	if (!correct) {
// 		return next(new AppError("Your current password is wrong.", 401));
// 	}

// 	// 3) If so, update the password
// 	user.password = req.body.password;
// 	user.passwordConfirm = req.body.passwordConfirm;
// 	await user.save();

// 	// 4) send JWT
// 	createSendToken(user, 200, res);
// });
