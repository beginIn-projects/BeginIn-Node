const nodemailer = require('nodemailer');

// transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.html || options.message
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Email error: ', error);
    throw new Error('Email could not be sent');
  }
};

//welcome email
const sendWelcomeEmail = async (user) => {
  const message = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #333; text-align: center;">Welcome to Our Platform!</h2>
      <p>Hi ${user.name},</p>
      <p>Thank you for joining our Influencer-Brand Marketplace! We're excited to have you on board.</p>
      <p>Your account has been created successfully. You can now start exploring the platform.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/login" 
           style="background-color: #007cba; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Login to Your Account
        </a>
      </div>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The Influencer-Brand Marketplace Team</p>
    </div>
  `;
  
  return await sendEmail({
    email: user.email,
    subject: 'Welcome to Influencer-Brand Marketplace!',
    html: message
  });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
  const message = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
      <p>Please click on the following link to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        This link will expire in 10 minutes. If you did not request this, please ignore this email and your password will remain unchanged.
      </p>
      <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
    </div>
  `;
  
  return await sendEmail({
    email: user.email,
    subject: 'Password Reset Request',
    html: message
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};