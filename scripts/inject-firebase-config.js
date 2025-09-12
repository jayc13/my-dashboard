const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

console.log(__dirname)

const swPath = path.join(__dirname, '../client/dist/sw.js');
if (!fs.existsSync(swPath)) {
    throw new Error(`File not found: ${swPath}`);
}

let swContent = fs.readFileSync(swPath, 'utf8');

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

const configString = `const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 4)};`;

// Replace the config block in sw.js
swContent = swContent.replace(
    /const firebaseConfig = \{[\s\S]*?\};/,
    configString
);

fs.writeFileSync(swPath, swContent, 'utf8');
console.log('Firebase config injected into sw.js');