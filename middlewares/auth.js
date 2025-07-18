const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Response = require("../utils/response");
const responseHandler = new Response();
const logger = require("../utils/logger");

const createToken = async (user, req, res) => {
    const payload = {
        id: user.id,
    };
    const expiresIn = parseInt(process.env.TOKEN_TIME, 10) || 3600;
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
        algorithm: "HS512",
        expiresIn: expiresIn
    });
    const expiresInRefresh = parseInt(process.env.REFRESH_TOKEN_TIME, 10) || 604800;
    const refreshToken = jwt.sign(payload, process.env.SECRET_KEY, {
        algorithm: "HS512",
        expiresIn: expiresInRefresh
    });

    return {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        token,
        refreshToken,
        status: 'token'
    };
};

const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded);
        });
    });
};

const tokenCheck = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            logger.error("Authorization header missing or malformed");
            return responseHandler.error401(res, "Authorization header missing or malformed");
        }
        const token = authHeader.split(" ")[1];
        const decoded = await verifyToken(token);

        const user = await User.findById(decoded.id);


        req.user = user;
        next();
    } catch (error) {

        if (error instanceof jwt.JsonWebTokenError) {
            logger.error("Invalid token", error);
            return responseHandler.error401(res);
        }
        if (error instanceof jwt.TokenExpiredError) {
            logger.error("Token expired", error);
            return responseHandler.error401(res, "Token expired");
        }
        logger.error("Token verification failed", error);
        return responseHandler.error500(res);
    }
};


const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            logger.error("Refresh Token required");
            return responseHandler.error400(res, "Refresh Token required");
            
        }

        const decoded = await verifyToken(refreshToken);

        const user = await User.findById(decoded.id);
        if (!user) {
            logger.error("User not found");
            return responseHandler.error404(res, "User not found");
        }
        // Create new tokens
        const tokenResponse = await createToken(user, req, res);

        res.json({
            success: true,
            token: tokenResponse.token,
            refreshToken: tokenResponse.refreshToken,
            message: "Token successfully refreshed",
        });
    } catch (error) {
        logger.error("Refresh token error", error);
        return responseHandler.error500(res);
    }
};


module.exports = {
    createToken,
    tokenCheck,
    refreshToken

};