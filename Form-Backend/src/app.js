// App.js
import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors"

dotenv.config();  // Load environment variables


const app = express();


// 1. Middleware for JSON and URL-encoded data
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
// 2. Session Middleware
app.use(
    session({
        secret: process.env.SECRET_KEY || "fallback-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
             secure:false,
            httpOnly: true,
            sameSite:"lax",
            maxAge: 5 * 60 * 1000, // 5 minutes
        },
    })
);

// 3. Static File Serving (Optional)
app.use(express.static("public"));

// 4. Test Session Middleware (Optional, remove in production)
app.use((req, res, next) => {
    console.log("Session Data:", req.session);
    next();
});

// 5. Routes
import userRegister from "./route/students.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { registerLimiter } from "./middlewares/rateLimiter.js";

app.use("/api/v1/student", userRegister);
app.use(registerLimiter);
app.use(errorHandler);

export { app };
