import path from "path";
import ejs from "ejs";
import puppeteer from "puppeteer";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import fs from "fs";
import fetch from "node-fetch";

interface PDFData {
  profileImage: string;
  firstName: string;
  lastName: string;
  registrationNo: {
    session: string;
    year: string;
    degree: string;
    rollNo: string;
  };
  email: string;
  whatsappNo: string;
  semester: string;
  role: string;
  reason: string;
  expectations: string;
  skills: string;
}

export async function generateJoinRequestPDF(data: PDFData): Promise<string> {
  try {
    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, "../../public/temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 1. Optimize the profile image before including it in the PDF
    const { optimizedImagePath, imageBase64 } = await optimizeImage(
      data.profileImage
    );

    // Use base64 data in the template instead of file path
    const optimizedData = {
      ...data,
      profileImage: imageBase64,
    };

    const templatePath = path.join(
      __dirname,
      "../views/pdf",
      "join-request-template.ejs"
    );

    // 2. Render HTML with optimized image
    const html = await ejs.renderFile(templatePath, optimizedData);

    // 3. Launch Puppeteer with optimized settings
    const browser = await puppeteer.launch({
      headless: "shell",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Set low-resolution device settings to reduce file size
    await page.emulateMediaType("screen");

    // Add optimization to reduce PDF size by disabling unnecessary features
    await page.evaluateHandle("document.fonts.ready");

    // Set content with a shorter timeout
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 10000,
    });

    const fileName = `join-request-${uuidv4()}.pdf`;
    const outputPath = path.join(__dirname, "../../public/temp", fileName);

    // 4. Add PDF optimization options
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      scale: 0.9, // Slightly reduce scale to decrease file size
      // Use lower quality
      omitBackground: false,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });

    await browser.close();

    // Cleanup optimized image if it was created
    if (
      optimizedImagePath &&
      optimizedImagePath !== data.profileImage &&
      fs.existsSync(optimizedImagePath)
    ) {
      fs.unlinkSync(optimizedImagePath);
    }

    return outputPath;
  } catch (err) {
    console.error("PDF generation failed:", err);
    throw new Error("Could not generate PDF");
  }
}

/**
 * Optimizes an image and returns both the path and base64 data
 * @param imagePath Path to the original image
 * @returns Object containing path to the optimized image and base64 data
 */
async function optimizeImage(
  imagePath: string
): Promise<{ optimizedImagePath: string; imageBase64: string }> {
  let buffer: Buffer;
  let outputPath: string = "";
  const tempDir = path.join(__dirname, "../../public/temp");

  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // If the image is a URL, try to fetch and optimize it
  if (imagePath.startsWith("http")) {
    try {
      outputPath = path.join(tempDir, `profile-${Date.now()}.jpg`);

      // Fetch from URL and optimize in one step
      const response = await fetch(imagePath);
      if (!response.ok)
        throw new Error(`Failed to fetch image: ${response.status}`);

      const imageBuffer = await response.arrayBuffer();

      buffer = await sharp(Buffer.from(imageBuffer))
        .resize(200, 280)
        .jpeg({ quality: 60, progressive: true })
        .toBuffer();

      // Write the buffer to file as well for cleanup purposes
      fs.writeFileSync(outputPath, buffer);
    } catch (error) {
      console.error("Error fetching and optimizing remote image:", error);
      // Try to read directly as fallback
      try {
        buffer = fs.readFileSync(imagePath);
      } catch (readError) {
        console.error("Cannot read original image:", readError);
        throw new Error("Image processing failed");
      }
    }
  } else {
    try {
      // For local images
      outputPath = path.join(tempDir, `optimized-${path.basename(imagePath)}`);

      buffer = await sharp(imagePath)
        .resize(200, 280)
        .jpeg({
          quality: 60,
          progressive: true,
          optimizeScans: true,
        })
        .toBuffer();

      // Write the buffer to file as well for cleanup purposes
      fs.writeFileSync(outputPath, buffer);
    } catch (error) {
      console.error("Error optimizing local image:", error);
      // Fallback to reading the original image
      try {
        buffer = fs.readFileSync(imagePath);
        outputPath = imagePath;
      } catch (readError) {
        console.error("Cannot read original image:", readError);
        throw new Error("Image processing failed");
      }
    }
  }

  // Convert the buffer to base64
  const imageBase64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;

  return { optimizedImagePath: outputPath, imageBase64 };
}
