const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

async function checkMongoDB() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/imageupload");
    console.log("✅ Connected to MongoDB");

    // Get database reference
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: "images" });

    // List all files
    console.log("\n📁 Files in GridFS:");
    const files = await bucket.find({}).toArray();

    if (files.length === 0) {
      console.log("❌ No files found in GridFS");
    } else {
      console.log(`✅ Found ${files.length} file(s):\n`);

      files.forEach((file, index) => {
        console.log(`📄 File ${index + 1}:`);
        console.log(`   ID: ${file._id}`);
        console.log(`   Filename: ${file.filename}`);
        console.log(`   Size: ${file.length} bytes`);
        console.log(`   Upload Date: ${file.uploadDate}`);
        console.log(`   Content Type: ${file.contentType || "Not specified"}`);
        if (file.metadata) {
          console.log(`   Metadata:`, file.metadata);
        }
        console.log("");
      });
    }

    // Check collections
    console.log("📊 MongoDB Collections:");
    const collections = await db.listCollections().toArray();
    collections.forEach((col) => {
      console.log(`   - ${col.name}`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

checkMongoDB();
