import { NextResponse } from "next/server";
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    // Validate inputs
    if (!name || !email) {
      return NextResponse.json(
        { message: "Name and email are required" },
        { status: 400 }
      );
    }

    // Create email to yourself (notification)
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = "New Contact Form Submission";
    sendSmtpEmail.htmlContent = `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
    `;
    sendSmtpEmail.sender = {
      name: process.env.YOUR_NAME,
      email: process.env.YOUR_EMAIL_ADDRESS
    };
    sendSmtpEmail.to = [{
      email: process.env.YOUR_EMAIL_ADDRESS,
      name: process.env.YOUR_NAME
    }];

    // Send notification email to yourself
    await apiInstance.sendTransacEmail(sendSmtpEmail);

    // Send confirmation email to the subscriber
    const confirmationEmail = new SibApiV3Sdk.SendSmtpEmail();
    confirmationEmail.subject = "Thanks for subscribing!";
    confirmationEmail.htmlContent = `
      <h3>Thanks for subscribing!</h3>
      <p>Hi ${name},</p>
      <p>Thank you for subscribing to our newsletter!</p>
      <p>Best regards,<br>${process.env.YOUR_NAME}</p>
    `;
    confirmationEmail.sender = {
      name: process.env.YOUR_NAME,
      email: process.env.YOUR_EMAIL_ADDRESS
    };
    confirmationEmail.to = [{
      email: email,
      name: name
    }];

    // Send confirmation email to subscriber
    await apiInstance.sendTransacEmail(confirmationEmail);

    return NextResponse.json(
      { message: "Thanks for subscribing!" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
} 