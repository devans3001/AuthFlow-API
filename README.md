# 🔐 AuthFlow API

A secure authentication API built with Node.js, Express, and MongoDB featuring JWT authentication, password reset, and role-based access control.

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)

## 🌟 Features

- User registration & login
- JWT authentication
- Password reset via email
- Role-based authorization
- Rate limiting
- Secure password hashing
- CORS protection
- Comprehensive error handling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account or local MongoDB
- SMTP service (or Ethereal for testing)

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/authflow-api.git
cd authflow-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Configuration

Edit the .env file:
env

NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://your-mongodb-uri
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRES_IN=30d
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your@ethereal.email
SMTP_PASSWORD=your-ethereal-password
SMTP_FROM_EMAIL=noreply@authflow.com

Running the Server
```bash

# Development (with nodemon)
npm run dev

# Production
npm start
```

📚 API Documentation

Live API documentation is available at:
https://authflow-api-psls.onrender.com
Key Endpoints
Method	Endpoint	Description
POST	/api/v1/auth/register	Register new user
POST	/api/v1/auth/login	User login
POST	/api/v1/auth/forgot-password	Request password reset
PATCH	/api/v1/auth/reset-password/:token	Reset password

🛡️ Security Features

    Password Hashing: Bcrypt with 12 salt rounds

    JWT: Signed tokens with expiration

    Rate Limiting:

        100 requests/15min for general API

        10 requests/15min for auth endpoints

    CORS: Restricted to approved origins

    Helmet: Secure HTTP headers

    Input Validation: Comprehensive request validation
