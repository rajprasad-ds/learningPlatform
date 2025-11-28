const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const API_KEY = env.BUNNY_API_KEY;
const LIBRARY_ID = env.BUNNY_STREAM_LIBRARY_ID;
const VIDEO_ID = 'ad2e3047-9e19-4175-bd7d-bf3a3bd76291'; // From user's URL

if (!API_KEY || !LIBRARY_ID) {
    console.error('Missing API Key or Library ID');
    process.exit(1);
}

const options = {
    hostname: 'video.bunnycdn.com',
    path: `/library/${LIBRARY_ID}/videos/${VIDEO_ID}`,
    method: 'GET',
    headers: {
        'AccessKey': API_KEY,
        'Accept': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json, null, 2));
        } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log('Raw data:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e);
});

req.end();
