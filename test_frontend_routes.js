const http = require('http');

function checkUrl(urlPath) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3001${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ path: urlPath, status: res.statusCode, length: data.length, title: (data.match(/<title>(.*?)<\/title>/) || [])[1] });
      });
    });
  });
}

async function verifyRoutes() {
  const root = await checkUrl('/');
  const auditView = await checkUrl('/audit/view');
  
  console.log('--- FRONTEND ROUTE VERIFICATION ---');
  console.log('GET /           -> Status:', root.status, '| Title:', root.title, '| Size:', root.length, 'bytes');
  console.log('GET /audit/view -> Status:', auditView.status, '| Title:', auditView.title, '| Size:', auditView.length, 'bytes');
}

verifyRoutes();
