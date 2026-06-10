const prisma = require('./db');

async function testConnection() {
  console.log('Testing connection to Prisma database...');
  try {
    const userCount = await prisma.user.count();
    console.log(`Connection successful! Total users in DB: ${userCount}`);
    
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    if (admin) {
      console.log(`Seeded admin found: ${admin.email}`);
    } else {
      console.log('No admin user found.');
    }

    const settings = await prisma.shopSettings.findFirst();
    if (settings) {
      console.log(`Shop settings found: Open from ${settings.openTime} to ${settings.closeTime}`);
    } else {
      console.log('No shop settings found.');
    }
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
