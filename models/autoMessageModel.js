

const mongoose = require('mongoose');

const autoMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  sendDate: {
    type: Date,
    required: true
  },
  isQueued: {
    type: Boolean,
    default: false
  },
  isSent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('AutoMessage', autoMessageSchema);