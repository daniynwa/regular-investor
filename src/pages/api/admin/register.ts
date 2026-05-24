import type { APIRoute } from 'astro';
import { registerAdmin } from '../../../lib/auth.js';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email dan password wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Format email tidak valid' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: 'Password minimal 6 karakter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await registerAdmin(email, password, name || '');

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      status: result.status,
      message: result.status === 'active'
        ? 'Registrasi berhasil! Anda bisa login sekarang.'
        : 'Registrasi berhasil! Akun Anda menunggu persetujuan admin.',
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
