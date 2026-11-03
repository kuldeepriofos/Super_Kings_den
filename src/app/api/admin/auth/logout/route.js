import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '../../../../../lib/auth';

function clearCookie(response) {
  try {
    response.cookies.delete(AUTH_COOKIE_NAME);
  } catch (e) {}

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });
  return response;
}

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
  return clearCookie(response);
}

export async function GET(request) {
  const loginUrl = new URL('/admin/login/', request.url);
  const response = NextResponse.redirect(loginUrl);
  return clearCookie(response);
}
