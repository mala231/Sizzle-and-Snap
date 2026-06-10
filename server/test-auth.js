const BASE_URL = 'http://localhost:5000/api/auth';

async function runTests() {
  console.log('--- Starting Auth API Tests ---');

  const testUser = {
    email: `test-${Date.now()}@test.com`,
    name: 'Test Customer',
    phone: '555-0199',
    password: 'password123'
  };

  // Test 1: Register a new customer
  try {
    console.log('\nTest 1: Registering a new customer...');
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(body, null, 2));
    if (res.status !== 201 || !body.data.token) {
      throw new Error('Register failed!');
    }
  } catch (err) {
    console.error('Test 1 failed:', err.message);
    process.exit(1);
  }

  // Test 2: Register duplicate email
  try {
    console.log('\nTest 2: Registering duplicate email...');
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(body, null, 2));
    if (res.status !== 400 || !body.error) {
      throw new Error('Duplicate register check failed!');
    }
  } catch (err) {
    console.error('Test 2 failed:', err.message);
    process.exit(1);
  }

  // Test 3: Login successfully
  let token = '';
  try {
    console.log('\nTest 3: Logging in with correct credentials...');
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(body, null, 2));
    if (res.status !== 200 || !body.data.token) {
      throw new Error('Login failed!');
    }
    token = body.data.token;
  } catch (err) {
    console.error('Test 3 failed:', err.message);
    process.exit(1);
  }

  // Test 4: Login with incorrect password
  try {
    console.log('\nTest 4: Logging in with incorrect password...');
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'wrongpassword'
      })
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(body, null, 2));
    if (res.status !== 400 || !body.error) {
      throw new Error('Incorrect password check failed!');
    }
  } catch (err) {
    console.error('Test 4 failed:', err.message);
    process.exit(1);
  }

  // Test 5: Logout
  try {
    console.log('\nTest 5: Logging out...');
    const res = await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(body, null, 2));
    if (res.status !== 200 || !body.data.message) {
      throw new Error('Logout failed!');
    }
  } catch (err) {
    console.error('Test 5 failed:', err.message);
    process.exit(1);
  }

  console.log('\n--- All Auth API Tests Passed! ---');
}

runTests();
