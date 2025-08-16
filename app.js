// Import required modules
import express from 'express';
import helmet from 'helmet'; // Security middleware
import cors from 'cors'; // Cross-Origin Resource Sharing
import rateLimit from 'express-rate-limit'; // Request rate limiting
import morgan from 'morgan'; // HTTP request logger
import {router as authRoutes} from './src/routes/authRouter.js'; // Our authentication routes
import { errorHandler } from './src/utils/AppError.js';

// Initialize Express application
const app = express();

// =============================================
// 🛡️  MIDDLEWARE STACK (Executed in order)
// =============================================

// 1. Helmet: Sets various HTTP headers for security
app.use(helmet());

// 2. CORS: Enable Cross-Origin Resource Sharing
// (Configure properly for production! This is permissive for development)
app.use(cors());

// 3. Body Parser: Read JSON data from requests (limit to 10kb)
app.use(express.json({ limit: '10kb' }));

// 4. Morgan: HTTP request logger (shows requests in console)
// 'dev' format gives concise output: GET /api/users 200 12.5 ms
app.use(morgan('dev'));

// =============================================
// 🚦 REQUEST THROTTLING (Rate Limiting)
// =============================================
// Limits each IP to 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: 'Too many attempts! Please try again later'
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);
app.use('/api', limiter); // Apply to all routes starting with /api

// =============================================
// 🛣️  ROUTES
// =============================================
// Mount authentication routes at /api/v1/auth
// Example: /api/v1/auth/register, /api/v1/auth/login
app.use('/api/v1/auth', authRoutes);
app.get("/",(req,res)=>{
  res.json("home")
})

// =============================================
// 🚨 ERROR HANDLING
// =============================================
// This catches any errors thrown in routes
// The errorHandler middleware formats the error response
app.use(errorHandler);

// Export the configured Express app
export default app;