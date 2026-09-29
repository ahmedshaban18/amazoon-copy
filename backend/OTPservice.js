import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  port:465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  //host :'smtp.gmail.com',
  
});

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); 
};



export const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `<${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `<h2>Hello ${email.split('@')[0]},</h2>
    <p>Thank you for registering on our platform.</p>
    <p>Your <b>verification code</b> is:</p>
    <h1 style="color:orange;">${otp}</h1>
    <p>Please enter this code to verify your email address.</p>
    <br/>
    <small>This email was sent automatically. Please do not reply.</small>`
  });
  
};

export const sendResetPasswordEmail = async (email, resetLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Please click the link below to reset your password:\n\n${resetLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('The reset password email has been sent');
  } catch (error) {
    console.error('Error sending reset password email:', error.message);
    throw new Error('Unable to send reset password email');
  }
};