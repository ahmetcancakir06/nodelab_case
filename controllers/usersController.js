const Users = require("../models/userModel"); 
const logger = require("../utils/logger");
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const rename = promisify(fs.rename);
const { getRedisClient } = require('../config/redis');


const getUsers = async (req, res) => {
    try {
        const users = await Users.find({ deleted: false }).select('-password'); // Exclude password field
        if (!users || users.length === 0) {
            logger.error('No users found');
            return res.status(404).json({ success: false, data: 'No users found' });
        }
        logger.info('Users retrieved successfully');
        
        const redis = getRedisClient();
        const onlineUserIds = new Set(await redis.sMembers('online_users'));
        const usersWithStatus = users.map(user => {
            const userObj = user.toObject();
            userObj.isOnline = onlineUserIds.has(user._id.toString());
            return userObj;
        });
        return res.json({ success: true, data: usersWithStatus });

       
    } catch (error) {
        logger.error('Users get error:', error);
        res.status(500).json({ success: false,data: 'Users get error' });
    }
};

const getUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await Users.findOne({ _id: userId, deleted: false }).select('-password'); // Exclude password field
        // Check if user exists
        if (!user) {
            logger.error(`User not found: ${userId}`);
            return res.status(404).json({ success: false, data: 'User not found!' });
        }
        logger.info(`User retrieved: ${userId}`);
        return res.json({ success: true, data: user });
    } catch (error) {
        logger.error('Error retrieving user:', error);
        return res.status(500).json({ success: false, data: 'User not found!' });
    }
}

const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!userId) {
            logger.error('User ID is required for update');
            return res.status(400).json({ success: false, data: 'User ID is required' });
        }
        const {username, email, password} = req.body;
        const user = await Users.findOne({ email });
        if (!user) {
            logger.error(`User not found: ${email}`);
            return res.status(404).json({success: false, data: 'User not found'});
        }
        if (userId !== user.id) {
            logger.error(`User ID mismatch: ${userId} does not match ${user.id}`);
            return res.status(400).json({success: false, data: 'User ID mismatch'});
        }

        user.username = username;
        user.email = email;
        if (password) {
            user.password = password; // Password should be hashed in the model pre-save hook
        }   
        await user.save();
        // successful user update log
        logger.info(`User updated successfully: ${userId}`);
        return res.json({success: true, message: 'User succesful update', data: user.select('-password')}); // Exclude password field from response
    } catch (error) {
        // error log
        logger.error('Error updating user:', error);
        if (error instanceof APIError) {
            return res.status(error.statusCode).json({success: false, data: error.message});
        } else {
            return res.status(500).json({success: false, data: 'An unexpected error occurred while updating the user.'});
        }
    }
}

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await Users.findOne({ _id: userId, deleted: false });
        // Check if user exists
        if (!user) {
            logger.error(`User not found: ${userId}`);
            return res.status(404).json({success: false, data: 'User not found'});
        }

        // Soft delete the user
        user.deleted = true;
        await user.save();
        // Log the deletion
        logger.info(`User deleted successfully: ${userId}`);
        return res.json({success: true, message: 'User deleted successfully'});
    } catch (error) {
        logger.error('Error deleting user:', error);
        if (error instanceof APIError) {
            return res.status(error.statusCode).json({success: false, data: error.message});
        } else {
            return res.status(500).json({success: false, data: 'An unexpected error occurred while deleting the user.'});
        }
    }
}

// Check Token
const checkToken = (req, res) => {
    return res.json({ success: true, message: 'Token is valid' });
};

// Return Online Users
const getOnlineUsers = async (req, res) => {
    const redis = getRedisClient();
    try {
        const onlineUserIds = await redis.sMembers('online_users');
        const users = await Users.find(
            { _id: { $in: onlineUserIds } },
            '_id username'
        );
        res.json({ success: true, data: users });
    } catch (error) {
        logger.error('Error fetching online user list:', error);
        res.status(500).json({ success: false, message: 'Error fetching online users' });
    }
};

// Return online users count
const getOnlineUserCount = async (req, res) => {
    const redis = getRedisClient();
    try {
        const count = await redis.sCard('online_users');
        res.json({ success: true, count });
    } catch (error) {
        logger.error('Error fetching online user count:', error);
        res.status(500).json({ success: false, message: 'Error fetching count' });
    }
};

// Check member is online 
const getUserOnlineStatus = async (req, res) => {
    const redis = getRedisClient();
    try {
        const isOnline = await redis.sIsMember('online_users', req.params.id);
        res.json({ success: true, online: Boolean(isOnline) });
    } catch (error) {
        logger.error('Error checking user online status:', error);
        res.status(500).json({ success: false, message: 'Error checking status' });
    }
};

module.exports = {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    checkToken,
    getOnlineUsers,
    getOnlineUserCount,
    getUserOnlineStatus
};