const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Đăng ký người dùng mới
exports.register = async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10); // Mã hóa mật khẩu
    const newUser = new User({ username, password: hashedPassword, role });

    try {
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !user.comparePassword(password)) {
        console.log('Invalid credentials'); // Log thông báo lỗi
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = user.generateToken();
    console.log('Generated Token:', token); // Log token để kiểm tra
    res.json({
        token,
        role: user.role,
    });
};