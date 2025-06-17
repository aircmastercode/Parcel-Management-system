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
 * Mock function to simulate sending OTP via third-party service
 * @param {string} recipient - Phone number or email to send OTP to
 * @param {string} otp - OTP code
 * @returns {Promise} - Promise with success/error
 */
const sendOTP = async (recipient, otp) => {
  // In a real application, this would call an external API
  // For simulation/development, we'll just log it
  console.log(`MOCK OTP SERVICE: OTP ${otp} sent to ${recipient}`);
  
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock response
  return {
    success: true,
    message: `OTP sent successfully to ${recipient}`
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
  verifyOTP
}; 