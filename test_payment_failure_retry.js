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

async function runFailureRetryTest() {
  const convId = 'session-fail-retry-' + Date.now().toString().slice(-4);
  console.log('================================================================');
  console.log(` 🧪 STARTING PAYMENT FAILURE & RETRY SCENARIO (ConvID: ${convId})`);
  console.log('================================================================\n');

  // STEP 1: Chat Prompt
  console.log('👉 STEP 1: Sending user query "mujhe ek blue shirt chahiye under 1000"...');
  const chatRes = await makeRequest('/chat', 'POST', {
    message: 'mujhe ek blue shirt chahiye under 1000',
    conversation_id: convId
  });
  console.log('Chat Status:', chatRes.status);
  console.log('Proposed Product:', chatRes.data.proposed_product_id, `(₹${chatRes.data.proposed_price})`);
  console.log('----------------------------------------------------------------\n');

  // STEP 2: Initial Order Confirmation
  console.log('👉 STEP 2: Confirming order for proposed product prod_1...');
  const confirmRes1 = await makeRequest('/checkout/confirm', 'POST', {
    product_id: chatRes.data.proposed_product_id,
    conversation_id: convId
  });
  console.log('Order 1 Status:', confirmRes1.status);
  console.log('Razorpay Order 1 ID:', confirmRes1.data.order_id);
  console.log('----------------------------------------------------------------\n');

  // STEP 3: Simulate Failed Payment (using test card 4000000000000002)
  console.log('👉 STEP 3: Simulating FAILED payment (Card: 4000000000000002 - Insufficient Funds)...');
  const failRes = await makeRequest('/payment/verify', 'POST', {
    conversation_id: convId,
    order_id: confirmRes1.data.order_id,
    card_number: '4000000000000002',
    status: 'failed'
  });
  console.log('Payment Verification Status:', failRes.status);
  console.log('Agent Response Body:', JSON.stringify(failRes.data, null, 2));
  console.log('----------------------------------------------------------------\n');

  // STEP 4: User accepts retry & re-confirms checkout for order retry
  console.log('👉 STEP 4: User accepts retry & re-confirms checkout for retry attempt...');
  const confirmRes2 = await makeRequest('/checkout/confirm', 'POST', {
    product_id: chatRes.data.proposed_product_id,
    conversation_id: convId
  });
  console.log('Retry Order Status:', confirmRes2.status);
  console.log('Razorpay Retry Order ID:', confirmRes2.data.order_id);
  console.log('----------------------------------------------------------------\n');

  // STEP 5: Retry Payment - SUCCESS (using valid card 4111111111111111)
  console.log('👉 STEP 5: Executing RETRY payment (Card: 4111111111111111 - Success)...');
  const successRes = await makeRequest('/payment/verify', 'POST', {
    conversation_id: convId,
    order_id: confirmRes2.data.order_id,
    card_number: '4111111111111111',
    status: 'success'
  });
  console.log('Retry Payment Status:', successRes.status);
  console.log('Order Capture Result:', JSON.stringify(successRes.data, null, 2));
  console.log('----------------------------------------------------------------\n');

  // STEP 6: Retrieve and Print Full Audit Trail for this conversation
  console.log(`👉 STEP 6: Fetching FULL AUDIT TRAIL for conversation_id="${convId}"...`);
  const auditRes = await makeRequest(`/audit?conversation_id=${convId}`, 'GET');
  console.log('\n================================================================');
  console.log(' 📜 COMPLETE AUDIT TRAIL OUTPUT FOR FAILED PAYMENT → SUCCESSFUL RETRY');
  console.log('================================================================');
  console.log(JSON.stringify(auditRes.data, null, 2));
  console.log('================================================================');
}

runFailureRetryTest().catch(console.error);
