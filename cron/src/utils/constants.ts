import * as dotenv from 'dotenv';

dotenv.config();

export const API_BASE_URL: string = process.env.API_URL || 'http://localhost:3000';