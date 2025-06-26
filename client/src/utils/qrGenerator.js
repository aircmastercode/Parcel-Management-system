// Simple QR code generation for parcel tracking
// Using a lightweight approach without external dependencies

export const generateTrackingURL = (trackingNumber) => {
  const baseURL = window.location.origin;
  return `${baseURL}/track/${trackingNumber}`;
};

export const generateQRCodeDataURL = (text, size = 200) => {
  // Create a simple QR code using a free API service
  const qrAPI = `https://api.qrserver.com/v1/create-qr-code/`;
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: text,
    format: 'png',
    bgcolor: 'ffffff',
    color: '1e40af',
    margin: '10',
    qzone: '1'
  });
  
  return `${qrAPI}?${params.toString()}`;
};

export const downloadQRCode = async (trackingNumber, parcelInfo) => {
  const trackingURL = generateTrackingURL(trackingNumber);
  const qrCodeURL = generateQRCodeDataURL(trackingURL, 300);
  
  try {
    // Create a canvas to add text to the QR code
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 450;
    
    // Load the QR code image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        // Fill background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR code
        ctx.drawImage(img, 50, 50, 300, 300);
        
        // Add text
        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Railway Parcel Tracking`, canvas.width / 2, 30);
        
        ctx.font = '16px Arial';
        ctx.fillText(`Tracking: ${trackingNumber}`, canvas.width / 2, 380);
        
        if (parcelInfo.from && parcelInfo.to) {
          ctx.font = '14px Arial';
          ctx.fillText(`${parcelInfo.from} → ${parcelInfo.to}`, canvas.width / 2, 405);
        }
        
        ctx.font = '12px Arial';
        ctx.fillText(`Status: ${parcelInfo.status}`, canvas.width / 2, 425);
        
        // Download the image
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `parcel-qr-${trackingNumber}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve();
        });
      };
      
      img.onerror = reject;
      img.src = qrCodeURL;
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}; 