import jwt from "jsonwebtoken";
import config from "../config/index.js";

function generateAccessToken(userId, role) {
	return jwt.sign({ userId, role }, config.jwtSecret, {
		expiresIn: config.jwtAccessTime,
	});
}

export async function loginService(user) {
	const accessToken = generateAccessToken(user._id, user.role);

	return { accessToken };
}
