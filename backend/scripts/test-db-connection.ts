/**
 * Database Connection Diagnostic Script
 * Run: npx ts-node -T scripts/test-db-connection.ts
 */

import { PrismaClient } from '@prisma/client';

async function testConnection() {
  console.log('='.repeat(60));
  console.log('DATABASE CONNECTION DIAGNOSTIC');
  console.log('='.repeat(60));

  // Check DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('\n❌ DATABASE_URL is not set in .env file');
    process.exit(1);
  }

  // Parse and mask URL for display
  try {
    const url = new URL(dbUrl);
    const maskedUrl = `${url.protocol}//${url.username}:****@${url.host}${url.pathname}`;
    console.log(`\n📍 Database URL: ${maskedUrl}`);
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port || '5432'}`);
    console.log(`   Database: ${url.pathname.slice(1)}`);
    console.log(`   SSL: ${url.searchParams.get('sslmode') || 'default'}`);
  } catch (e) {
    console.error('\n❌ Invalid DATABASE_URL format');
    process.exit(1);
  }

  // Test Prisma connection
  console.log('\n🔌 Testing Prisma connection...');
  const prisma = new PrismaClient({
    log: ['error'],
  });

  const startTime = Date.now();

  try {
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test, current_database() as db, version() as version`;
    const elapsed = Date.now() - startTime;

    console.log(`\n✅ CONNECTION SUCCESSFUL (${elapsed}ms)`);
    console.log('\nDatabase info:');
    console.log(result);

    // Check if tables exist
    console.log('\n📊 Checking schema...');
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;

    if (tables.length === 0) {
      console.log('   No tables found. Run: npx prisma db push');
    } else {
      console.log(`   Found ${tables.length} tables:`);
      tables.slice(0, 10).forEach((t) => console.log(`   - ${t.tablename}`));
      if (tables.length > 10) console.log(`   ... and ${tables.length - 10} more`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE IS READY');
    console.log('='.repeat(60));
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error(`\n❌ CONNECTION FAILED (${elapsed}ms)`);
    console.error('\nError details:');
    console.error(`   Code: ${error.code || 'unknown'}`);
    console.error(`   Message: ${error.message}`);

    // Provide specific guidance based on error
    console.log('\n💡 Troubleshooting:');

    if (error.code === 'P1001') {
      console.log('   → Cannot reach database server');
      console.log('   → Check if host/port are correct');
      console.log('   → Check firewall/VPN/proxy settings');
      console.log('   → Try alternative database (Neon.tech)');
    } else if (error.code === 'P1000') {
      console.log('   → Authentication failed');
      console.log('   → Check username/password in DATABASE_URL');
    } else if (error.code === 'P1003') {
      console.log('   → Database does not exist');
      console.log('   → Create database or check DATABASE_URL');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('   → DNS resolution failed');
      console.log('   → Check internet connection');
      console.log('   → Try using IP address instead of hostname');
    } else if (error.message.includes('ETIMEDOUT')) {
      console.log('   → Connection timeout');
      console.log('   → Host might be blocked by firewall');
      console.log('   → Try disabling VPN/Cloudflare WARP');
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Load .env
require('dotenv').config();

testConnection();
