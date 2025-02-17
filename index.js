const express = require('express');
const connectDB = require('./db');
const authRoutes = require('./App/routes/authRoutes');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
connectDB();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.listen(5000, () => console.log("Server running on port 5000"));
