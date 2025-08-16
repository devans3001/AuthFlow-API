import dotenv from 'dotenv';
import { cleanEnv, str, num } from 'envalid';

dotenv.config();

export const env = cleanEnv(process.env, {
  MONGO_URI: str(),
  SMTP_PORT: num(),
  SMTP_HOST: str(),
  SMTP_PASSWORD: str(),
  SMTP_USER: str(),
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str({ default: '30d' }),
  PORT: num({ default: 5000 }),
});