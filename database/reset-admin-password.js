#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// Emergency Admin Password Reset Script
// ═══════════════════════════════════════════════════════════════════════════
// Usage:
//   node database/reset-admin-password.js <email> <new-password>
//
// Example:
//   node database/reset-admin-password.js admin@example.com MyNewPassword123
//
// This script directly updates the password in the database without
// requiring an active session. Use this if you're locked out of the admin.
// ═══════════════════════════════════════════════════════════════════════════

import { webcrypto } from 'node:crypto';
import mysql from 'mysql2/promise';
import { config } from 'dotenv';

// Load .env from project root
config();

const crypto = webcrypto;

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(bits)));
  const saltB64 = btoa(String.fromCharCode(...salt));
  return `${saltB64}:${hashB64}`;
}

async function main() {
  const [,, email, newPassword] = process.argv;

  if (!email || !newPassword) {
    console.error('\n❌ Usage: node database/reset-admin-password.js <email> <new-password>\n');
    console.error('Example: node database/reset-admin-password.js admin@example.com MyNewPassword123\n');
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error('\n❌ Password harus minimal 6 karakter.\n');
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('\n❌ DATABASE_URL tidak ditemukan di .env\n');
    console.error('Pastikan file .env ada di root project dengan format:');
    console.error('DATABASE_URL=mysql://user:password@host:3306/regular_investor\n');
    process.exit(1);
  }

  let connection;
  try {
    console.log(`\n🔄 Menghubungkan ke database...`);
    connection = await mysql.createConnection(dbUrl);

    // Check if user exists
    const [rows] = await connection.execute(
      'SELECT id, email, name, status FROM admin_users WHERE email = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      console.error(`\n❌ Admin dengan email "${email}" tidak ditemukan.\n`);
      console.log('Admin yang terdaftar:');
      const [allUsers] = await connection.execute('SELECT email, name, status FROM admin_users');
      allUsers.forEach(u => console.log(`  - ${u.email} (${u.name || 'no name'}) [${u.status}]`));
      console.log('');
      process.exit(1);
    }

    const user = rows[0];
    console.log(`📧 Ditemukan: ${user.email} (${user.name || 'no name'}) [${user.status}]`);

    // Hash new password
    console.log('🔐 Hashing password baru...');
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await connection.execute(
      'UPDATE admin_users SET password_hash = ? WHERE id = ?',
      [passwordHash, user.id]
    );

    // Also ensure user is active
    if (user.status !== 'active') {
      await connection.execute(
        'UPDATE admin_users SET status = ? WHERE id = ?',
        ['active', user.id]
      );
      console.log('✅ Status diubah ke "active"');
    }

    console.log(`\n✅ Password untuk "${email}" berhasil direset!`);
    console.log('   Silakan login di /admin dengan password baru.\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error('\nPastikan:');
    console.error('  1. Database MySQL sedang berjalan');
    console.error('  2. DATABASE_URL di .env sudah benar');
    console.error('  3. Tabel admin_users sudah dibuat (jalankan database/schema.sql)\n');
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

main();
