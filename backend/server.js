const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const routes = require('./routes');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình Multer để lưu file vào bộ nhớ tạm
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Cho phép các loại file tài liệu phổ biến
        const allowedTypes = [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Gắn middleware upload vào app.locals
app.locals.upload = upload;

// Kết nối đến cơ sở dữ liệu MongoDB
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Cấu hình CORS linh hoạt
const allowedOrigins = [
    'http://localhost:3000', // Cho phép khi chạy trên localhost
    process.env.FRONTEND_URL // URL frontend khi deploy trên Vercel, cấu hình trong .env hoặc Vercel dashboard
].filter(Boolean); // Lọc bỏ các giá trị undefined

app.use(cors({
    origin: (origin, callback) => {
        // Cho phép yêu cầu không có origin (như Postman) hoặc origin nằm trong danh sách được phép
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use('/api', routes);
app.use('/api/auth', authRoutes);

// Xóa các log về request
app.use((req, res, next) => {
    next();
});

// Xóa các log về response
app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function(body) {
        return originalSend.call(this, body);
    };
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ 
            message: 'File upload error', 
            error: err.message 
        });
    }
    res.status(500).json({ 
        message: 'Internal server error',
        error: err.message
    });
});

// Chạy server trên localhost
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;