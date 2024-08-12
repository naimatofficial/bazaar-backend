import dotenv from "dotenv";

dotenv.config();

const config = {
	port: process.env.PORT || 3000,
	dbURI: process.env.DB_URI,
	jwtSecret: process.env.JWT_SECRET,
	jwtAccessTime: process.env.JWT_ACCESS_TIME,
};

export default config;
