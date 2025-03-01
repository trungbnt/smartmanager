const mongoose = require('mongoose');

const jobRequestSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    requestId: {
        type: String,
        unique: true,
        required: true
    }
});

// Add virtual getter for status label
jobRequestSchema.virtual('statusLabel').get(function() {
    const labels = {
        pending: 'Chờ xử lý',
        processing: 'Đang xử lý',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy'
    };
    return labels[this.status] || 'Chờ xử lý';
});

// Ensure virtuals are included when converting to JSON
jobRequestSchema.set('toJSON', {
    virtuals: true
});

const JobRequest = mongoose.model('JobRequest', jobRequestSchema);
module.exports = JobRequest;