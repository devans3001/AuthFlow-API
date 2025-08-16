// Import required modules
import express from 'express';
import helmet from 'helmet'; // Security middleware
import cors from 'cors'; // Cross-Origin Resource Sharing
import rateLimit from 'express-rate-limit'; // Request rate limiting
import morgan from 'morgan'; // HTTP request logger
import { router as authRoutes } from './src/routes/authRouter.js'; // Authentication routes
import { errorHandler } from './src/utils/AppError.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize Express application
const app = express();

// =============================================
// 🛡️  MIDDLEWARE STACK (Executed in order)
// =============================================

// 1. Helmet: Sets various HTTP headers for security
app.use(helmet());

// 2. CORS: Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000',"http://localhost:5000"] // Allow localhost in development
    : ['https://authflow-api-psls.onrender.com'], // Your production domain
  credentials: true // If using cookies
}));

// 3. Body Parser: Read JSON data from requests (limit to 10kb)
app.use(express.json({ limit: '10kb' }));

// 4. Serve static files (must come before other routes)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, './src/public')));

// 5. Morgan: HTTP request logger
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// =============================================
// 🚦 REQUEST THROTTLING (Rate Limiting)
// =============================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts! Please try again later'
});

// Apply rate limiting
app.use('/api', limiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);

// =============================================
// 🛣️  ROUTES
// =============================================
app.use('/api/v1/auth', authRoutes);

// Home route (must come after static middleware)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './src/public/index.html'));
});

// =============================================
// 🚨 ERROR HANDLING
// =============================================
app.use(errorHandler);

// Export the configured Express app
export default app;