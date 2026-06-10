const AUTH_URL = 'http://localhost:5000/api/auth';
const MENU_URL = 'http://localhost:5000/api/menu';
const ORDERS_URL = 'http://localhost:5000/api/orders';
const SETTINGS_URL = 'http://localhost:5000/api/settings';

async function runOrdersTests() {
  console.log('--- Starting Orders & Settings API Tests ---');

  let adminToken = '';
  let customerToken = '';
  let item1Id = null;
  let item2Id = null;
  let guestOrderId = null;
  let customerOrderId = null;

  // 1. Admin login
  try {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@vendor.com', password: 'adminpassword' })
    });
    const body = await res.json();
    adminToken = body.data.token;
    console.log('Step 1: Admin login successful.');
  } catch (err) {
    console.error('Admin login failed:', err.message);
    process.exit(1);
  }

  // 1.5. Force shop open so we can place test orders outside standard hours
  try {
    console.log('Step 1.5: Setting shop override to Force Open for testing...');
    await fetch(SETTINGS_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ isOpenOverride: true })
    });
  } catch (err) {
    console.error('Force open settings failed:', err.message);
    process.exit(1);
  }

  // 2. Create test items
  try {
    const res1 = await fetch(MENU_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ name: 'Order Test Burger', description: 'Test', price: '10.00', category: 'Burgers' })
    });
    const item1 = await res1.json();
    item1Id = item1.data.id;

    const res2 = await fetch(MENU_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ name: 'Order Test Fries', description: 'Test', price: '5.00', category: 'Fries' })
    });
    const item2 = await res2.json();
    item2Id = item2.data.id;

    console.log('Step 2: Test menu items created successfully.');
  } catch (err) {
    console.error('Menu items creation failed:', err.message);
    process.exit(1);
  }

  // 3. Place guest order
  try {
    console.log('\nStep 3: Placing guest order...');
    const res = await fetch(ORDERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'John Guest',
        customerPhone: '111-2222',
        items: [
          { menuItemId: item1Id, quantity: 2 },
          { menuItemId: item2Id, quantity: 1 }
        ]
      })
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(body, null, 2));
    if (res.status !== 201 || parseFloat(body.data.totalAmount) !== 25 || body.data.discountApplied !== false) {
      throw new Error('Guest order validation failed!');
    }
    guestOrderId = body.data.id;
  } catch (err) {
    console.error('Guest order failed:', err.message);
    process.exit(1);
  }

  // 4. Register customer
  try {
    const uniqueEmail = `cust-${Date.now()}@test.com`;
    const res = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, name: 'Jane Cust', phone: '222-3333', password: 'password123' })
    });
    const body = await res.json();
    customerToken = body.data.token;
    console.log('\nStep 4: Customer registration successful.');
  } catch (err) {
    console.error('Customer registration failed:', err.message);
    process.exit(1);
  }

  // 5. Place registered customer order (should get 5% discount)
  try {
    console.log('\nStep 5: Placing customer order...');
    const res = await fetch(ORDERS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        customerName: 'Jane Cust',
        customerPhone: '222-3333',
        items: [
          { menuItemId: item1Id, quantity: 1 } // 10.00 -> 5% off -> 9.50
        ]
      })
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(body, null, 2));
    if (res.status !== 201 || parseFloat(body.data.totalAmount) !== 9.5 || body.data.discountApplied !== true) {
      throw new Error('Customer order discount validation failed!');
    }
    customerOrderId = body.data.id;
  } catch (err) {
    console.error('Customer order failed:', err.message);
    process.exit(1);
  }

  // 6. Shop setting override: Force Closed
  try {
    console.log('\nStep 6: Setting shop override to Force Closed...');
    const patchRes = await fetch(SETTINGS_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ isOpenOverride: false })
    });
    const patchBody = await patchRes.json();
    console.log('PATCH Settings Status:', patchRes.status);
    console.log('PATCH Settings Body:', JSON.stringify(patchBody, null, 2));

    // Try placing order while closed
    console.log('Attempting to place order while shop is forced closed...');
    const orderRes = await fetch(ORDERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'John Guest',
        customerPhone: '111-2222',
        items: [{ menuItemId: item2Id, quantity: 1 }]
      })
    });
    const orderBody = await orderRes.json();
    console.log('Order Status (Expected 403):', orderRes.status);
    console.log('Order Body:', JSON.stringify(orderBody, null, 2));
    if (orderRes.status !== 403) {
      throw new Error('Order was placed successfully while shop is closed! Invariant violation!');
    }

    // Restore override to force open for remaining tests
    console.log('Restoring shop settings override to Force Open...');
    await fetch(SETTINGS_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ isOpenOverride: true })
    });
  } catch (err) {
    console.error('Shop settings override test failed:', err.message);
    process.exit(1);
  }

  // 7. Test sold-out items
  try {
    console.log('\nStep 7: Marking item 1 as unavailable...');
    await fetch(`${MENU_URL}/${item1Id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ isAvailable: false })
    });

    console.log('Attempting to order sold-out item...');
    const orderRes = await fetch(ORDERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'John Guest',
        customerPhone: '111-2222',
        items: [{ menuItemId: item1Id, quantity: 1 }]
      })
    });
    const orderBody = await orderRes.json();
    console.log('Order Status (Expected 400):', orderRes.status);
    console.log('Order Body:', JSON.stringify(orderBody, null, 2));
    if (orderRes.status !== 400 || !orderBody.error) {
      throw new Error('Order went through with sold-out item! Invariant violation!');
    }

    // Restore item availability
    await fetch(`${MENU_URL}/${item1Id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ isAvailable: true })
    });
  } catch (err) {
    console.error('Sold out test failed:', err.message);
    process.exit(1);
  }

  // 8. Patch order status
  try {
    console.log(`\nStep 8: Changing guest order ID ${guestOrderId} status to ready...`);
    const resReady = await fetch(`${ORDERS_URL}/${guestOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'ready' })
    });
    const bodyReady = await resReady.json();
    console.log('Status Ready:', resReady.status, bodyReady.data.status);

    console.log(`Changing guest order ID ${guestOrderId} status to completed...`);
    const resComp = await fetch(`${ORDERS_URL}/${guestOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'completed' })
    });
    const bodyComp = await resComp.json();
    console.log('Status Completed:', resComp.status, bodyComp.data.status);
    if (bodyComp.data.status !== 'completed') {
      throw new Error('Order status update failed!');
    }
  } catch (err) {
    console.error('Order status patch failed:', err.message);
    process.exit(1);
  }

  // 9. Fetch orders lists
  try {
    console.log('\nStep 9: Checking admin orders list...');
    const adminRes = await fetch(ORDERS_URL, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminBody = await adminRes.json();
    console.log('Admin orders count:', adminBody.data.length);

    console.log('Checking customer orders list...');
    const custRes = await fetch(`${ORDERS_URL}/my`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const custBody = await custRes.json();
    console.log('Customer orders count (Expected 1):', custBody.data.length);
    if (custBody.data.length !== 1 || custBody.data[0].id !== customerOrderId) {
      throw new Error('Customer order history check failed!');
    }
  } catch (err) {
    console.error('Orders lists fetch failed:', err.message);
    process.exit(1);
  }

  // 10. Clean up items and reset settings
  try {
    console.log('\nStep 10: Cleaning up test menu items...');
    await fetch(`${MENU_URL}/${item1Id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    await fetch(`${MENU_URL}/${item2Id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    console.log('Resetting shop settings override to follow schedule (null)...');
    await fetch(SETTINGS_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ isOpenOverride: null })
    });
    console.log('Cleanup and reset complete.');
  } catch (err) {
    console.error('Cleanup failed:', err.message);
  }

  console.log('\n--- All Orders & Settings API Tests Passed! ---');
}

runOrdersTests();
