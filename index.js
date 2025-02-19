const express = require('express');
const connectDB = require('./db');
const authRoutes = require('./App/routes/authRoutes');
const userRoutes = require('./App/routes/userRoutes');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
connectDB();
app.use(express.json());

// all api routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);


// start server
app.listen(5000, () => console.log("Server running on port 5000"));
