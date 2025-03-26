import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error('BREVO_API_KEY is not defined');
    }

    // Use Brevo's REST API directly instead of the SDK
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: body.name,
          email: body.email,
        },
        to: [{
          email: process.env.CONTACT_EMAIL || 'your-email@example.com',
          name: 'Recipient Name'
        }],
        subject: 'New Contact Form Submission',
        htmlContent: `
          <p>Name: ${body.name}</p>
          <p>Email: ${body.email}</p>
          <p>Message: ${body.message}</p>
        `
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 