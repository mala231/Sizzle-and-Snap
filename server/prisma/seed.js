const prisma = require('../db');
const bcrypt = require('bcryptjs');

async function main() {
  // Hash password
  const adminPassword = 'adminpassword';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  // Seed Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@vendor.com' },
    update: {},
    create: {
      email: 'admin@vendor.com',
      name: 'Admin User',
      phone: '1234567890',
      passwordHash,
      role: 'admin'
    }
  });

  console.log('Seeded admin user:', adminUser.email);

  // Seed Default Shop Settings
  const settingsCount = await prisma.shopSettings.count();
  if (settingsCount === 0) {
    const settings = await prisma.shopSettings.create({
      data: {
        isOpenOverride: null,
        openTime: '10:00',
        closeTime: '16:00'
      }
    });
    console.log('Seeded default shop settings:', settings);
  } else {
    console.log('Shop settings already exist.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
