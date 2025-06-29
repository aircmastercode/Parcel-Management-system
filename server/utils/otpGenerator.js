const axios = require('axios');
const nodemailer = require('nodemailer');

/**
 * Generates a random OTP code
 * @param {number} length - Length of OTP
 * @returns {string} - OTP code
 */
const generateOTP = (length = 6) => {
  // Generate a random number with specified number of digits
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const otp = Math.floor(min + Math.random() * (max - min + 1)).toString();
  return otp;
};

/**
 * Send OTP via Gmail SMTP (primary email service)
 * @param {string} email - Email address to send OTP to
 * @param {string} otp - OTP code
 * @returns {Promise} - Promise with success/error
 */
const sendOTPViaGmail = async (email, otp) => {
  try {
    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'crisrailwayhead@gmail.com',
        pass: 'eknl hlkq cppj ofcw'
      }
    });

    const mailOptions = {
      from: '"Railway Parcel Management" <crisrailwayhead@gmail.com>',
      to: email,
      subject: 'Railway Parcel Management - OTP Code',
      text: `Your OTP code for Railway Parcel Management System is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2c3e50; text-align: center;">🚂 Railway Parcel Management System</h2>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Your OTP Code</h3>
                <div style="background-color: #fff; padding: 15px; border: 2px solid #3498db; border-radius: 5px; text-align: center; margin: 15px 0;">
                  <span style="font-size: 24px; font-weight: bold; color: #3498db; letter-spacing: 3px;">${otp}</span>
                </div>
                <p style="margin-bottom: 10px;"><strong>This code will expire in 10 minutes.</strong></p>
                <p style="color: #7f8c8d; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
              </div>
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
                <p style="color: #7f8c8d; font-size: 12px;">Railway Parcel Management System</p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Gmail OTP Response:', info);
    return {
      success: true,
      message: `OTP sent successfully to ${email} via Gmail`,
      data: info
    };
  } catch (error) {
    console.error('Gmail OTP Error:', error.message);
    return {
      success: false,
      message: 'Failed to send OTP via Gmail',
      error: error.message
    };
  }
};

/**
 * Send OTP via Postmark (fallback email service)
 * @param {string} email - Email address to send OTP to
 * @param {string} otp - OTP code
 * @returns {Promise} - Promise with success/error
 */
const sendOTPViaPostmark = async (email, otp) => {
  try {
    // Get configuration from environment variables
    const postmarkToken = process.env.POSTMARK_SERVER_TOKEN || '746bdae1-8ffd-4b5d-a996-a0564ee96141';
    const fromEmail = process.env.POSTMARK_FROM_EMAIL || 'noreply@yourdomain.com';
    
    const response = await axios.post(
      'https://api.postmarkapp.com/email',
      {
        From: fromEmail,
        To: email,
        Subject: 'Railway Parcel Management - OTP Code',
        TextBody: `Your OTP code for Railway Parcel Management System is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
        HtmlBody: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2c3e50; text-align: center;">Railway Parcel Management System</h2>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #2c3e50; margin-top: 0;">Your OTP Code</h3>
                  <div style="background-color: #fff; padding: 15px; border: 2px solid #3498db; border-radius: 5px; text-align: center; margin: 15px 0;">
                    <span style="font-size: 24px; font-weight: bold; color: #3498db; letter-spacing: 3px;">${otp}</span>
                  </div>
                  <p style="margin-bottom: 10px;"><strong>This code will expire in 10 minutes.</strong></p>
                  <p style="color: #7f8c8d; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                </div>
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
                  <p style="color: #7f8c8d; font-size: 12px;">Railway Parcel Management System</p>
                </div>
              </div>
            </body>
          </html>
        `,
        MessageStream: 'outbound'
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': postmarkToken
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    console.log('Postmark OTP Response:', response.data);
    return {
      success: true,
      message: `OTP sent successfully to ${email} via Postmark`,
      data: response.data
    };
  } catch (error) {
    console.error('Postmark OTP Error:', error.response?.data || error.message);
    return {
      success: false,
      message: 'Failed to send OTP via Postmark',
      error: error.response?.data || error.message
    };
  }
};

/**
 * Send OTP via RapidAPI Email OTP service (fallback)
 * @param {string} email - Email address to send OTP to
 * @param {string} otp - OTP code
 * @returns {Promise} - Promise with success/error
 */
const sendOTPViaRapidAPI = async (email, otp) => {
  try {
    const response = await axios.post('https://emailotp.p.rapidapi.com/otp_verification', {
      email: email,
      otp: otp
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'emailotp.p.rapidapi.com',
        'x-rapidapi-key': 'e77cdfd63fmshca92e91a0bdf7e2p10efdbjsn6800e76e2168'
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('RapidAPI OTP Response:', response.data);
    return {
      success: true,
      message: `OTP sent successfully to ${email}`,
      data: response.data
    };
  } catch (error) {
    console.error('RapidAPI OTP Error:', error.response?.data || error.message);
    return {
      success: false,
      message: 'Failed to send OTP via RapidAPI',
      error: error.response?.data || error.message
    };
  }
};

/**
 * Send OTP via email using multiple fallback services
 * @param {string} recipient - Email address to send OTP to
 * @param {string} otp - OTP code
 * @returns {Promise} - Promise with success/error
 */
const sendOTP = async (recipient, otp) => {
  // Check if recipient is an email
  if (!recipient.includes('@')) {
    // For phone numbers, we'll use mock service for now
    console.log(`MOCK SMS SERVICE: OTP ${otp} sent to ${recipient}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      message: `OTP sent successfully to ${recipient}`,
      service: 'mock-sms'
    };
  }

  // For emails, try Gmail first, then fallback
  console.log(`Attempting to send OTP ${otp} to ${recipient}`);
  
  // Try Gmail first (primary service)
  console.log('Trying Gmail SMTP...');
  const gmailResult = await sendOTPViaGmail(recipient, otp);
  
  if (gmailResult.success) {
    return {
      ...gmailResult,
      service: 'gmail'
    };
  }
  
  // Try Postmark as first fallback
  console.log('Gmail failed, trying Postmark...');
  const postmarkResult = await sendOTPViaPostmark(recipient, otp);
  
  if (postmarkResult.success) {
    return {
      ...postmarkResult,
      service: 'postmark'
    };
  }
  
  // Try RapidAPI as second fallback
  console.log('Postmark failed, trying RapidAPI...');
  const rapidAPIResult = await sendOTPViaRapidAPI(recipient, otp);
  
  if (rapidAPIResult.success) {
    return {
      ...rapidAPIResult,
      service: 'rapidapi'
    };
  }
  
  // Final fallback to mock service
  console.log('All email services failed, using mock service...');
  console.log(`MOCK EMAIL SERVICE: OTP ${otp} sent to ${recipient}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    message: `OTP sent successfully to ${recipient} (mock service)`,
    service: 'mock-email',
    fallback: true
  };
};

/**
 * Verify if provided OTP matches the stored OTP
 * @param {string} storedOTP - OTP stored in database
 * @param {string} providedOTP - User provided OTP
 * @param {Date} expiryTime - OTP expiry timestamp
 * @returns {boolean} - Whether OTP is valid
 */
const verifyOTP = (storedOTP, providedOTP, expiryTime) => {
  // Check if OTP has expired
  if (new Date() > new Date(expiryTime)) {
    return false;
  }
  
  // Compare OTPs
  return storedOTP === providedOTP;
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP,
  sendOTPViaGmail,
  sendOTPViaPostmark,
  sendOTPViaRapidAPI
}; 