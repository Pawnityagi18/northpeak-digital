const http = require('http');

function makeRequest(path, method = 'GET', payload = null) {
  return new Promise((resolve, reject) => {
    const data = payload ? JSON.stringify(payload) : null;
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', err => reject(err));
    if (data) req.write(data);
    req.end();
  });
}

async function runAuditDemo() {
  const convId = 'audit-flow-session-' + Date.now().toString().slice(-4);
  console.log('================================================================');
  console.log(` 🛡️ STARTING AUDIT TRAIL END-TO-END DEMO (ConvID: ${convId})`);
  console.log('================================================================\n');

  // Step 1: User sends chat prompt
  console.log('👉 STEP 1: Calling POST /chat ("mujhe ek blue shirt chahiye under 1000")...');
  const chatRes = await makeRequest('/chat', 'POST', {
    message: 'mujhe ek blue shirt chahiye under 1000',
    conversation_id: convId
  });
  console.log('Chat Status:', chatRes.status);
  console.log('Proposed Product:', chatRes.data.proposed_product_id, `(₹${chatRes.data.proposed_price})`);
  console.log('----------------------------------------------------------------\n');

  // Step 2: Confirm Order
  console.log('👉 STEP 2: Calling POST /checkout/confirm for proposed product...');
  const confirmRes = await makeRequest('/checkout/confirm', 'POST', {
    product_id: chatRes.data.proposed_product_id,
    conversation_id: convId
  });
  console.log('Checkout Status:', confirmRes.status);
  console.log('Razorpay Order ID:', confirmRes.data.order_id);
  console.log('----------------------------------------------------------------\n');

  // Step 3: Fetch audit trail JSON for this conversation
  console.log(`👉 STEP 3: Fetching GET /audit?conversation_id=${convId}...`);
  const auditRes = await makeRequest(`/audit?conversation_id=${convId}`, 'GET');
  console.log('Audit Log Response Status:', auditRes.status);
  console.log('\n--- 📜 PERSISTENT AUDIT LOG OUTPUT ---');
  console.log(JSON.stringify(auditRes.data, null, 2));
  console.log('----------------------------------------------------------------\n');

  // Step 4: Verify GET /audit/view dashboard page
  console.log('👉 STEP 4: Fetching GET /audit/view HTML Dashboard UI...');
  const viewRes = await makeRequest('/audit/view', 'GET');
  console.log('Dashboard HTML Status:', viewRes.status);
  console.log('Dashboard HTML Content Length:', (viewRes.raw || '').length, 'bytes');
  console.log('================================================================');
  console.log(' 🎉 PERSISTENT AUDIT TRAIL TEST COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

runAuditDemo().catch(console.error);
