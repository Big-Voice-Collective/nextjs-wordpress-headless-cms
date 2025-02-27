require('dotenv').config({ path: '.env.local' });

const express = require('express');
const next = require('next');
const bodyParser = require('body-parser');
const cors = require('cors');
const SibApiV3Sdk = require('sib-api-v3-sdk');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3002;

// Add initial environment check
console.log('Environment Check:', {
  hasBrevoKey: !!process.env.BREVO_API_KEY,
  emailConfigured: process.env.YOUR_EMAIL_ADDRESS,
  nameConfigured: process.env.YOUR_NAME
});

// Configure Brevo
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Test the API key is loaded
console.log('API Key loaded:', process.env.BREVO_API_KEY ? 'Yes' : 'No');
console.log('Email address configured:', process.env.YOUR_EMAIL_ADDRESS);

// Log initial configuration
console.log('Starting server with config:', {
  port: port,
  hasApiKey: !!process.env.BREVO_API_KEY,
  emailConfigured: !!process.env.YOUR_EMAIL_ADDRESS
});

app.prepare().then(() => {
  const server = express();

  // Middleware
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));

  // Enable CORS
  server.use(cors());

  // Error handling middleware
  server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
  });

  // Add some example Express routes
  server.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Express!' });
  });

  // Contact form endpoint
  server.post('/api/contact', async (req, res) => {
    console.log('Contact form submission received:', req.body);
    try {
      const { name, email } = req.body;

      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      
      // Log email configuration
      console.log('Preparing email with config:', {
        senderEmail: process.env.YOUR_EMAIL_ADDRESS,
        senderName: process.env.YOUR_NAME,
        recipientEmail: process.env.YOUR_EMAIL_ADDRESS,
        recipientName: process.env.YOUR_NAME,
        formName: name,
        formEmail: email
      });

      sendSmtpEmail.subject = "New Contact Form Submission";
      sendSmtpEmail.htmlContent = `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
      `;
      sendSmtpEmail.sender = {
        name: process.env.YOUR_NAME || 'Website Contact Form',
        email: process.env.YOUR_EMAIL_ADDRESS
      };
      sendSmtpEmail.to = [{
        email: process.env.YOUR_EMAIL_ADDRESS,
        name: process.env.YOUR_NAME
      }];

      console.log('Attempting to send email...');
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Contact form email sent successfully');
      
      res.json({ message: 'Thanks for subscribing!' });
    } catch (error) {
      console.error('Detailed error:', {
        name: error.name,
        message: error.message,
        response: error.response?.text,
        stack: error.stack
      });
      res.status(500).json({ 
        message: 'Failed to send message',
        error: error.message 
      });
    }
  });

  // Add a simple test route
  server.get('/test', (req, res) => {
    res.json({ message: 'Server is working' });
  });

  // Test email endpoint
  server.get('/api/test-email', async (req, res) => {
    console.log('Test email endpoint hit');
    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      
      sendSmtpEmail.subject = "URGENT: Test Email from Website " + new Date().toISOString();
      sendSmtpEmail.htmlContent = `
        <h1>This is a test email</h1>
        <p>Sent at: ${new Date().toLocaleString()}</p>
        <p>If you receive this, please check your Brevo dashboard and respond.</p>
      `;
      sendSmtpEmail.sender = {
        name: 'Website Test',
        email: process.env.YOUR_EMAIL_ADDRESS
      };
      sendSmtpEmail.to = [{
        email: process.env.YOUR_EMAIL_ADDRESS,
        name: process.env.YOUR_NAME
      }];

      console.log('Attempting to send test email to:', process.env.YOUR_EMAIL_ADDRESS);
      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Test email sent successfully:', result);

      res.json({ 
        success: true, 
        message: 'Test email sent',
        recipientEmail: process.env.YOUR_EMAIL_ADDRESS,
        messageId: result.messageId
      });
    } catch (error) {
      console.error('Test email failed:', {
        message: error.message,
        details: error.response?.text
      });
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // Handle all other routes with Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}); 