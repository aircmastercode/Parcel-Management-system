// Test OTP generator directly
const { generateOTP, sendOTP } = require('./utils/otpGenerator');

async function testOTPDirect() {
  console.log('🧪 Testing OTP Generator Directly...\n');
  
  // Generate OTP
  const otp = generateOTP(6);
  console.log('Generated OTP:', otp);
  
  // Test sending to Tanush's email
  const email = 'tanushsinghal22082004@gmail.com';
  console.log(`Sending OTP ${otp} to ${email}...`);
  
  try {
    const result = await sendOTP(email, otp);
    console.log('✅ OTP Send Result:', result);
  } catch (error) {
    console.error('❌ OTP Send Error:', error.message);
    console.error('Full error:', error);
  }
}

testOTPDirect(); 