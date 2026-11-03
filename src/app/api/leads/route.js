import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Lead from '../../../models/Lead';

// Simple in-memory IP rate limiter to deter contact-form spam/floods.
// NOTE: per-instance only; back with Redis/Upstash for multi-instance deploys.
const submissionsMap = new Map();
const MAX_SUBMISSIONS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 5 submissions / 10 minutes per IP

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown-ip';
}

function checkLeadRateLimit(ip) {
  const now = Date.now();
  const record = submissionsMap.get(ip);
  if (!record || now - record.firstAt > WINDOW_MS) {
    submissionsMap.set(ip, { count: 1, firstAt: now });
    return true;
  }
  if (record.count >= MAX_SUBMISSIONS) return false;
  record.count += 1;
  return true;
}

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);
    if (!checkLeadRateLimit(clientIp)) {
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // 1. Honeypot Anti-Spam Check (hidden field filled by bots)
    if (body.website_url || body._gotcha) {
      // Silently pretend success to fool spambots
      return NextResponse.json({ success: true, message: 'Message submitted successfully' });
    }

    const { name, email, phone, subject, inquiryType, message, source } = body;

    // 2. Strict Input Validations
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Full name is required.' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message content is required.' },
        { status: 400 }
      );
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please write a message with at least 10 characters.' },
        { status: 400 }
      );
    }

    // 3. Connect DB
    await connectToDatabase();

    // 4. Capture Client IP & UA for audit
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '';
    const userAgent = request.headers.get('user-agent') || '';

    // 5. Create Lead
    const validInquiryTypes = ['general', 'editorial', 'partnership', 'correction', 'technical', 'other'];
    const safeInquiryType = validInquiryTypes.includes(inquiryType) ? inquiryType : 'general';

    const newLead = await Lead.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      subject: (subject || 'General Inquiry').trim(),
      inquiryType: safeInquiryType,
      message: message.trim(),
      source: source || 'contact_page',
      status: 'new',
      ip,
      userAgent,
      notes: [],
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out! Your message has been received by our editorial desk.',
      leadId: newLead._id,
    });
  } catch (err) {
    console.error('Lead submission error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit message. Please try again.' },
      { status: 500 }
    );
  }
}
