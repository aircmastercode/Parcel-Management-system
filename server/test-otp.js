const { generateOTP, sendOTP, sendOTPViaPostmark, sendOTPViaRapidAPI } = require('./utils/otpGenerator');

async function testOTP() {
  console.log('=== Testing OTP Generation ===');
  const otp = generateOTP(6);
  console.log('Generated OTP:', otp);
  
  console.log('\n=== Testing Individual OTP Services ===');
  const testEmail = 'tanushsinghal22082004@gmail.com'; // Using your email for testing
  
  console.log('\n1. Testing Postmark...');
  try {
    const result = await sendOTPViaPostmark(testEmail, otp);
    console.log('Postmark Result:', result);
  } catch (error) {
    console.error('Postmark Test Error:', error.message);
  }
  
  console.log('\n2. Testing RapidAPI...');
  try {
    const result = await sendOTPViaRapidAPI(testEmail, otp);
    console.log('RapidAPI Result:', result);
  } catch (error) {
    console.error('RapidAPI Test Error:', error.message);
  }
  
  console.log('\n=== Testing Main OTP Service (with fallback) ===');
  try {
    const result = await sendOTP(testEmail, otp);
    console.log('Main OTP Result:', result);
    console.log('Service Used:', result.service);
  } catch (error) {
    console.error('Main OTP Test Error:', error.message);
  }
  
  console.log('\n=== Testing Phone OTP Service ===');
  try {
    const result = await sendOTP('+1234567890', otp);
    console.log('Phone OTP Result:', result);
    console.log('Service Used:', result.service);
  } catch (error) {
    console.error('Phone OTP Test Error:', error.message);
  }
  
  console.log('\n=== Testing with admin email ===');
  try {
    const result = await sendOTP('admin@railway.com', otp);
    console.log('Admin Email OTP Result:', result);
    console.log('Service Used:', result.service);
  } catch (error) {
    console.error('Admin Email Test Error:', error.message);
  }
}

testOTP().catch(console.error); 