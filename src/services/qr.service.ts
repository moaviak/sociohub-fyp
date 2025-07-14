import QRCode from "qrcode";
import crypto from "crypto";

class QRService {
  async generateQRCode(registrationId: string) {
    try {
      // Create unique QR data
      const qrData = {
        registrationId,
        timestamp: Date.now(),
        hash: crypto
          .createHash("sha256")
          .update(registrationId + Date.now().toString())
          .digest("hex"),
      };

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));

      return qrCodeUrl;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error}`);
    }
  }

  // Verify QR code data
  verifyQRCode(qrData: string) {
    try {
      const parsedData = JSON.parse(qrData);

      // Basic validation
      if (
        !parsedData.registrationId ||
        !parsedData.timestamp ||
        !parsedData.hash
      ) {
        return false;
      }

      // Check timestamp (QR code should not be older than 1 year)
      const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
      if (parsedData.timestamp < oneYearAgo) {
        return false;
      }

      return parsedData;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new QRService();
