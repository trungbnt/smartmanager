const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    jobRequestId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Quote', quoteSchema);