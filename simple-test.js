const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");

async function testUpload() {
  console.log("🧪 Testing image upload...");

  try {
    // Check if test image exists
    const testImagePath = "kuldeep/frontend/src/assets/property-1.jpg";
    if (!fs.existsSync(testImagePath)) {
      console.log("❌ Test image not found");
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append("image", fs.createReadStream(testImagePath));

    console.log("📤 Uploading test image...");

    // Upload the image
    const response = await axios.post(
      "http://localhost:3000/upload",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    if (response.status === 200 && response.data.success) {
      console.log("✅ Upload successful!");
      console.log("📄 Response:", JSON.stringify(response.data, null, 2));

      const fileId = response.data.data.fileId;
      console.log(`🆔 File ID: ${fileId}`);

      // Test retrieval
      console.log("🔍 Testing image retrieval...");
      const retrieveResponse = await axios.get(
        `http://localhost:3000/images/${fileId}`,
        {
          responseType: "arraybuffer",
        }
      );

      if (retrieveResponse.status === 200) {
        console.log("✅ Image retrieval successful!");
        console.log(`📊 Retrieved ${retrieveResponse.data.length} bytes`);
      } else {
        console.log("❌ Image retrieval failed");
      }
    } else {
      console.log("❌ Upload failed");
      console.log("📄 Response:", response.data);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
    if (error.response) {
      console.log("📄 Error response:", error.response.data);
    }
  }
}

testUpload();
