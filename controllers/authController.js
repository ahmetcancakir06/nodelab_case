const Users = require("../models/userModel");
const logger = require("../utils/logger");
const bcrypt = require("bcrypt");
const APIError = require("../utils/errors");
const Response = require("../utils/response");
const { createToken } = require("../middlewares/auth");
const redisClient = require("../config/redis"); 
const { getIO } = require("../socket");
const io = getIO();

const login = async (req, res) => {
    let ip = 'Unknown IP';
    let userAgent = 'Unknown Agent';
    try {
        ip = req.ip || 'Unknown IP';
        userAgent = req.headers['user-agent'] || 'Unknown Agent';

        const { username, password } = req.body;

        if (!username || !password) throw new APIError('Username and Password required', 400);

      
        const users = await Users.findOne({ username });

        if (!users) {
            logger.error(`User not found: ${username}`);
            throw new APIError("Invalid Username or Password", 401);
        }

        const passwordCheck = await bcrypt.compare(password, users.password);

        if (!passwordCheck) {
            logger.error(`Invalid password for user: ${username}`);
            throw new APIError("Invalid Username or Password", 401);
        }
        logger.info(`User logged in successfully: ${username}`, { ip, userAgent });
        const tokenResponse = await createToken(users);
        return new Response(tokenResponse, "Login successful").success(res);
    } catch (error) {
        logger.error("Login error", error, { ip, userAgent });

        if (error instanceof APIError) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: 'An unexpected error occurred during login.' });
    }
};


const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        
        const existingUser = await Users.findOne({ email });
        if (existingUser) {

            throw new APIError("This email is already registered: "+email, 400);
        }
        const newUser = await Users.create({
            username,
            email,
            password,
        });

        const userResponse = {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
        };

        return new Response(userResponse, "User registered successfully").success(res);
    } catch (error) {
        logger.error("User registration error", error);
        if (error instanceof APIError) {
            return res.status(error.statusCode).json({ success: false, data: error.message });
        } else {
            return res.status(500).json({ success: false, data: "An unexpected error occurred during registration." });
        }
    }
};


const logout = async (req, res) => {
    try {
        const { username, id } = req.user;
        if (!username || !id) {
            throw new APIError("User not authenticated", 401);
        }
        await redisClient.sRem("online_users", id);
        io.emit("user_offline", { userId: id, username });

        if (req.token) {
            const tokenKey = `bl_${req.token}`;
            await redisClient.set(tokenKey, "true", "EX", 60 * 60 * 24); 
        }

        logger.info(`User logged out successfully: ${username}`);
        return res.status(200).json({ success: true, message: "Logout successful" });
    } catch (error) {
        logger.error("Logout error", error);
        return res.status(500).json({ success: false, message: "An unexpected error occurred during logout." });
    }
};

const me = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            throw new APIError("User not authenticated", 401);
        }
        return res.status(200).json({ 
            success: true, 
            data: { 
                username: user.username, 
                email: user.email 
            } 
        });
    } catch (error) {
        logger.error("Error fetching user data", error);
        return res.status(500).json({ success: false, message: "An unexpected error occurred while fetching user data." });
    }
};

module.exports = {
    login,
    register,
    logout,
    me
};