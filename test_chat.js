const http = require('http');

const data = JSON.stringify({
  message: "mujhe ek blue shirt chahiye under 1000",
  conversation_id: "test-session-hinglish"
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('RESPONSE:');
    try {
      console.log(JSON.stringify(JSON.parse(responseData), null, 2));
    } catch (e) {
      console.log(responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(data);
req.end();
