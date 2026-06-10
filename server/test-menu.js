const fs = require('fs');
const path = require('path');

const AUTH_URL = 'http://localhost:5000/api/auth/login';
const MENU_URL = 'http://localhost:5000/api/menu';

async function runMenuTests() {
  console.log('--- Starting Menu API Tests ---');

  let adminToken = '';

  // Step 1: Login as admin to get token
  try {
    console.log('Step 1: Logging in as admin...');
    const res = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendor.com',
        password: 'adminpassword'
      })
    });
    const body = await res.json();
    if (res.status !== 200 || !body.data.token) {
      throw new Error('Admin login failed. Make sure DB is seeded.');
    }
    adminToken = body.data.token;
    console.log('Admin login successful.');
  } catch (err) {
    console.error('Login failed:', err.message);
    process.exit(1);
  }

  let itemId = null;

  // Step 2: Create a menu item
  try {
    console.log('\nStep 2: Creating a new menu item...');
    const res = await fetch(MENU_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Delicious Fries',
        description: 'Golden crispy fries salted to perfection',
        price: '3.99',
        category: 'Fries'
      })
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(body, null, 2));
    if (res.status !== 201 || !body.data.id) {
      throw new Error('Menu item creation failed!');
    }
    itemId = body.data.id;
  } catch (err) {
    console.error('Create item failed:', err.message);
    process.exit(1);
  }

  // Step 3: Try to create item with invalid category (should fail with 400)
  try {
    console.log('\nStep 3: Creating item with invalid category...');
    const res = await fetch(MENU_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Invalid Item',
        description: 'Blah',
        price: '1.99',
        category: 'Pizza' // Invalid category
      })
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(body, null, 2));
    if (res.status !== 400 || !body.error) {
      throw new Error('Validation check for category failed!');
    }
  } catch (err) {
    console.error('Validation check failed:', err.message);
    process.exit(1);
  }

  // Step 4: Update item (PUT)
  try {
    console.log(`\nStep 4: Updating menu item ID ${itemId}...`);
    const res = await fetch(`${MENU_URL}/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Super Golden Fries',
        price: '4.50'
      })
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(body, null, 2));
    if (res.status !== 200 || body.data.name !== 'Super Golden Fries' || parseFloat(body.data.price) !== 4.5) {
      throw new Error('Menu item update failed!');
    }
  } catch (err) {
    console.error('Update item failed:', err.message);
    process.exit(1);
  }

  // Step 5: Upload image (POST /api/menu/:id/image)
  let uploadedFilename = '';
  try {
    console.log(`\nStep 5: Uploading image for menu item ID ${itemId}...`);
    const formData = new FormData();
    const fileContent = new Blob(['dummy png image data'], { type: 'image/png' });
    formData.append('image', fileContent, 'test-image.png');

    const res = await fetch(`${MENU_URL}/${itemId}/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
      body: formData
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(body, null, 2));
    if (res.status !== 200 || !body.data.imageUrl) {
      throw new Error('Image upload failed!');
    }
    uploadedFilename = body.data.imageUrl;
    
    // Check if file actually exists on filesystem
    const filePath = path.join(__dirname, 'uploads', uploadedFilename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Uploaded file not found on disk at: ${filePath}`);
    }
    console.log(`Verified: Image file successfully written to disk: ${filePath}`);
  } catch (err) {
    console.error('Image upload test failed:', err.message);
    process.exit(1);
  }

  // Step 6: Toggle availability (PATCH)
  try {
    console.log(`\nStep 6: Toggling availability for menu item ID ${itemId}...`);
    const res = await fetch(`${MENU_URL}/${itemId}/availability`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(body, null, 2));
    if (res.status !== 200 || body.data.isAvailable !== false) {
      throw new Error('Availability toggle failed!');
    }
  } catch (err) {
    console.error('Toggle availability failed:', err.message);
    process.exit(1);
  }

  // Step 7: Delete item (DELETE) and check file deletion
  try {
    console.log(`\nStep 7: Deleting menu item ID ${itemId}...`);
    const res = await fetch(`${MENU_URL}/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(body, null, 2));
    if (res.status !== 200) {
      throw new Error('Delete item failed!');
    }

    // Verify file is deleted from disk
    const filePath = path.join(__dirname, 'uploads', uploadedFilename);
    if (fs.existsSync(filePath)) {
      throw new Error(`File leak! Image file still exists on disk after deletion: ${filePath}`);
    }
    console.log(`Verified: Image file successfully deleted from disk: ${filePath}`);
  } catch (err) {
    console.error('Delete item test failed:', err.message);
    process.exit(1);
  }

  console.log('\n--- All Menu API Tests Passed! ---');
}

runMenuTests();
