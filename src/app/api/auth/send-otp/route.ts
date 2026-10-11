import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Brevo API Key
    const apiKey = process.env.BREVO_API_KEY;

    // Send email using Brevo REST API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: {
          name: "GenWorks Security",
          email: "rajeshw143w@gmail.com" // Brevo will send it if domain is authorized or just test
        },
        to: [
          {
            email: email,
            name: name
          }
        ],
        subject: "Your GenWorks Verification Code",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-w: 500px; margin: 0 auto; padding: 20px; border: 1px solid #E5E0C8; border-radius: 12px;">
            <h2 style="color: #1A1A1A;">Welcome to GenWorks, ${name}!</h2>
            <p style="color: #666; font-size: 16px;">Please use the following verification code to complete your registration:</p>
            <div style="background-color: #FEF9E1; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #D3A373;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 12px;">This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
          </div>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Brevo API Error:", data);
      return NextResponse.json({ error: 'Failed to send OTP via email service.' }, { status: 500 });
    }

    // In a real production app, we would hash this OTP and save it in MongoDB.
    // For this hackathon scope, we return it to the client to check (or you can use a fallback '123456')
    return NextResponse.json({ success: true, otp: otp });

  } catch (error) {
    console.error("OTP Route Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}