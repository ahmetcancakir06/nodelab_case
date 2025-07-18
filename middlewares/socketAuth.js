// middlewares/socketAuth.js
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const verifySocketJWT = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      const err = new Error("Token missing");
      err.data = { code: 401 };
      return next(err);
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id); 

    if (!user) {
      const err = new Error("User not found");
      err.data = { code: 404 };
      return next(err);
    }

    socket.user = user; // conncected user info
    next();
  } catch (err) {
    err.data = { code: 403 };
    next(err);
  }
};

module.exports = { verifySocketJWT };