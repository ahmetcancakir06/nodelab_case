const Message = require('../models/messageModel');

const saveMessageToDB = async ({ senderId, receiverId, content, roomId }) => {
    const newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
        conversationId: roomId,
    });
    await newMessage.save();
    return newMessage;
};

const getMessages = async (req, res) => {
    console.log("📥 Request received for messages");
    
    try {
        // Mark messages as read where receiver is the current user and isRead is false
        await Message.updateMany(
            { receiver: req.user._id, sender: req.params.userId, isRead: false },
            { $set: { isRead: true } }
        );
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user._id }
            ]
        }).sort({ createdAt: 1 });

        console.log("✅ Messages fetched:", messages.length);

        

        res.json({ success: true, data: messages });
    } catch (err) {
        console.error("❌ Error fetching messages:", err);
        res.status(500).json({ success: false, message: 'Error fetching messages' });
    }
};

module.exports = { saveMessageToDB, getMessages };