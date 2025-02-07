const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const routes = require('./routes');
const authRoutes = require('./routes/auth');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Kết nối đến cơ sở dữ liệu MongoDB
const mongoURI = 'mongodb+srv://trungcr:Bm@PjFRequYd5.r@smartmanager.xrsyb.mongodb.net/smart_manager'

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use('/api', routes); // Sử dụng các route API
app.use('/api/auth', authRoutes); // Sử dụng route cho auth

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 