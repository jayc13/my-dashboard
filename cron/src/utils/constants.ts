import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const API_BASE_URL: string = process.env.API_URL || 'http://localhost:3000';