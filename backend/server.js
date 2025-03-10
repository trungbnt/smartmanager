const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const routes = require('./routes');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2; // Thêm Cloudinary
require('dotenv').config(); // Thêm dotenv để tải biến môi trường

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
const mongoURI = 'mongodb+srv://trungcr:Bm@PjFRequYd5.r@smartmanager.xrsyb.mongodb.net/smart_manager';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});