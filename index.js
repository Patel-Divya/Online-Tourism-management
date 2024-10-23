require('dotenv').config();

const express = require('express');
const connectDB = require('./util/dbConnect');
const cors = require('cors');
const path = require('path');
const port = 5000;
const app = express();
const errorMiddleware = require('./middleware/error-middleware');
const authRouter = require('./route/auth-router');
const tripRouter = require('./route/trip-router');
const book_cart_router = require('./route/cart-book-router');
const adminRouter = require('./route/admin-router');
const session = require('express-session');

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET
}))

app.use(express.json());
const allowedOrigins = [
    'http://127.0.0.1:5501',  // Local frontend url
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allow any custom headers your frontend uses
    credentials: true  // Enable credentials (if cookies or HTTP auth are needed)
}));

app.use('/images', express.static(path.join(__dirname, 'images'))); // Serve static files from 'images' directory

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/trip', tripRouter);
app.use('/api/v1/cart', book_cart_router);
app.use('/api/v1/admin', adminRouter);

connectDB().then(()=>{
    app.listen(port, ()=>{
        console.log(`App is running on port: ${port}`);
    });
});

app.use(errorMiddleware);