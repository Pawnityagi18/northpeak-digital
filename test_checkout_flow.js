const http = require('http');

function makeRequest(path, method, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

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
    req.write(data);
    req.end();
  });
}

async function runTests() {
  const convId = 'session-checkout-demo-1';
  console.log('================================================================');
  console.log(' 🧪 STARTING CHECKOUT FLOW & GUARDRAIL INTEGRATION TESTS');
  console.log('================================================================\n');

  // STEP 1: Chat request for Blue Shirt
  console.log('👉 STEP 1: Sending user chat prompt "mujhe ek blue shirt chahiye under 1000"...');
  const chatRes1 = await makeRequest('/chat', 'POST', {
    message: 'mujhe ek blue shirt chahiye under 1000',
    conversation_id: convId
  });
  console.log('Chat Status:', chatRes1.status);
  console.log('Chat Reply:', chatRes1.data.reply_text);
  console.log('Proposed Product ID:', chatRes1.data.proposed_product_id);
  console.log('Proposed Price (INR):', chatRes1.data.proposed_price);
  console.log('----------------------------------------------------------------\n');

  // STEP 2: Try confirming UNPROPOSED product (prod_9)
  console.log('👉 STEP 2: Attempting to confirm UNPROPOSED product (prod_9)...');
  const badConfirm = await makeRequest('/checkout/confirm', 'POST', {
    product_id: 'prod_9',
    conversation_id: convId
  });
  console.log('Response Status:', badConfirm.status);
  console.log('Response Error Body:', JSON.stringify(badConfirm.data, null, 2));
  console.log('----------------------------------------------------------------\n');

  // STEP 3: Confirm VALID proposed product (prod_1)
  console.log('👉 STEP 3: Confirming VALID proposed product (prod_1)...');
  const validConfirm = await makeRequest('/checkout/confirm', 'POST', {
    product_id: 'prod_1',
    conversation_id: convId
  });
  console.log('Response Status:', validConfirm.status);
  console.log('Razorpay Order Creation Result:', JSON.stringify(validConfirm.data, null, 2));
  console.log('----------------------------------------------------------------\n');

  // STEP 4: Attempt DUPLICATE confirmation of already consumed proposal (prod_1)
  console.log('👉 STEP 4: Attempting DUPLICATE confirmation without fresh proposal...');
  const dupConfirm = await makeRequest('/checkout/confirm', 'POST', {
    product_id: 'prod_1',
    conversation_id: convId
  });
  console.log('Response Status:', dupConfirm.status);
  console.log('Response Error Body:', JSON.stringify(dupConfirm.data, null, 2));
  console.log('----------------------------------------------------------------\n');

  // STEP 5: Request 2nd product recommendation & confirm order #2
  console.log('👉 STEP 5: Requesting 2nd product ("mujhe white formal shirt chahiye")...');
  const chatRes2 = await makeRequest('/chat', 'POST', {
    message: 'mujhe white formal shirt chahiye',
    conversation_id: convId
  });
  console.log('Proposed Product ID:', chatRes2.data.proposed_product_id);
  
  console.log('Confirming Order #2...');
  const confirm2 = await makeRequest('/checkout/confirm', 'POST', {
    product_id: chatRes2.data.proposed_product_id,
    conversation_id: convId
  });
  console.log('Order #2 Status:', confirm2.status);
  console.log('Order #2 Result:', JSON.stringify(confirm2.data, null, 2));
  console.log('----------------------------------------------------------------\n');

  // STEP 6: Request 3rd product & attempt order #3 (Expect Anti-Runaway Guardrail Block)
  console.log('👉 STEP 6: Requesting 3rd product and attempting Order #3 (Testing Max 2 Limit)...');
  const chatRes3 = await makeRequest('/chat', 'POST', {
    message: 'mujhe black tshirt chahiye',
    conversation_id: convId
  });
  
  const confirm3 = await makeRequest('/checkout/confirm', 'POST', {
    product_id: chatRes3.data.proposed_product_id,
    conversation_id: convId
  });
  console.log('Order #3 Attempt Status:', confirm3.status);
  console.log('Anti-Runaway Block Response:', JSON.stringify(confirm3.data, null, 2));
  console.log('================================================================');
  console.log(' 🎉 ALL TEST SCENARIOS COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

runTests().catch(console.error);
