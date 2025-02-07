const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    jobRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobRequest',
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
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Quote = mongoose.model('Quote', quoteSchema);
module.exports = Quote; 