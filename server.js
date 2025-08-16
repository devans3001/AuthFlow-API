

import app from './app.js';
import { connectDB } from './src/config/db.js';


const PORT = process.env.PORT || 5000;

connectDB()

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥', err);
  process.exit(1);
});