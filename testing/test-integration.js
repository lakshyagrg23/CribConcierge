#!/usr/bin/env node

const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

/**
 * Integration Test Script for Image Upload Component
 * Tests the complete workflow from upload to retrieval
 */

const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
};

class IntegrationTester {
  constructor() {
    this.nodeServiceUrl = "http://localhost:3000";
    this.flaskServiceUrl = "http://localhost:5090";
    this.frontendUrl = "http://localhost:8080";
    this.uploadedImageId = null;
  }

  async checkServices() {
    log.info("Checking service availability...");

    const services = [
      { name: "Node.js Image Service", url: this.nodeServiceUrl },
      { name: "Flask Backend", url: this.flaskServiceUrl },
    ];

    for (const service of services) {
      try {
        await axios.get(service.url, { timeout: 5000 });
        log.success(`${service.name} is running`);
      } catch (error) {
        log.error(`${service.name} is not accessible at ${service.url}`);
        return false;
      }
    }
    return true;
  }

  async createTestImage() {
    log.info("Creating test JPEG image...");

    // Create a simple test image buffer (minimal JPEG)
    const testImagePath = path.join(__dirname, "test-image.jpg");

    // Check if we already have a test image
    if (fs.existsSync(testImagePath)) {
      log.success("Test image already exists");
      return testImagePath;
    }

    // For this test, we'll create a minimal JPEG header
    // In a real scenario, you'd have actual JPEG files
    const jpegHeader = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
      0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
      0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
      0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
      0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xd9,
    ]);

    fs.writeFileSync(testImagePath, jpegHeader);
    log.success("Test JPEG image created");
    return testImagePath;
  }

  async testImageUpload() {
    log.info("Testing image upload to Node.js service...");

    try {
      const testImagePath = await this.createTestImage();
      const formData = new FormData();
      formData.append("image", fs.createReadStream(testImagePath));

      const response = await axios.post(
        `${this.nodeServiceUrl}/upload`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        this.uploadedImageId = response.data.data.fileId;
        log.success(
          `Image uploaded successfully. File ID: ${this.uploadedImageId}`
        );
        return true;
      } else {
        log.error("Image upload failed");
        return false;
      }
    } catch (error) {
      log.error(`Image upload error: ${error.message}`);
      return false;
    }
  }

  async testImageRetrieval() {
    if (!this.uploadedImageId) {
      log.error("No uploaded image ID available");
      return false;
    }

    log.info("Testing image retrieval...");

    try {
      const response = await axios.get(
        `${this.nodeServiceUrl}/image/${this.uploadedImageId}`,
        {
          responseType: "arraybuffer",
        }
      );

      if (response.status === 200) {
        log.success("Image retrieved successfully");
        return true;
      } else {
        log.error("Image retrieval failed");
        return false;
      }
    } catch (error) {
      log.error(`Image retrieval error: ${error.message}`);
      return false;
    }
  }

  async testPropertyListingWithImages() {
    if (!this.uploadedImageId) {
      log.error("No uploaded image ID available");
      return false;
    }

    log.info("Testing property listing with image IDs...");

    try {
      const propertyData = {
        propertyName: "Test Property Integration",
        propertyAddress: "123 Test Street, Test City",
        propertyCostRange: "5000000",
        description:
          "A beautiful test property with all amenities for integration testing.",
        roomPhotoId: this.uploadedImageId,
        bathroomPhotoId: this.uploadedImageId,
        drawingRoomPhotoId: this.uploadedImageId,
        kitchenPhotoId: this.uploadedImageId,
      };

      const response = await axios.post(
        `${this.flaskServiceUrl}/addListing`,
        propertyData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data.msg === "Success") {
        log.success("Property listing created successfully with image IDs");
        log.info(`Property ID: ${response.data.propertyId}`);
        return true;
      } else {
        log.error("Property listing failed");
        return false;
      }
    } catch (error) {
      log.error(`Property listing error: ${error.message}`);
      return false;
    }
  }

  async testChatQuery() {
    log.info("Testing chat query about the property...");

    try {
      const query = "Tell me about the test property and its photos";
      const response = await axios.get(`${this.flaskServiceUrl}/askIt`, {
        params: { question: query },
      });

      if (response.status === 200 && response.data.answer) {
        log.success("Chat query successful");
        log.info(`Answer: ${response.data.answer.substring(0, 100)}...`);
        return true;
      } else {
        log.error("Chat query failed");
        return false;
      }
    } catch (error) {
      log.error(`Chat query error: ${error.message}`);
      return false;
    }
  }

  async testImageProxy() {
    if (!this.uploadedImageId) {
      log.error("No uploaded image ID available");
      return false;
    }

    log.info("Testing image retrieval through Flask proxy...");

    try {
      const response = await axios.get(
        `${this.flaskServiceUrl}/getImage/${this.uploadedImageId}`,
        {
          responseType: "arraybuffer",
        }
      );

      if (response.status === 200) {
        log.success("Image proxy working correctly");
        return true;
      } else {
        log.error("Image proxy failed");
        return false;
      }
    } catch (error) {
      log.error(`Image proxy error: ${error.message}`);
      return false;
    }
  }

  async cleanup() {
    log.info("Cleaning up test data...");

    // Delete test image if it exists
    const testImagePath = path.join(__dirname, "test-image.jpg");
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      log.success("Test image file deleted");
    }

    // Delete uploaded image from MongoDB
    if (this.uploadedImageId) {
      try {
        await axios.delete(
          `${this.nodeServiceUrl}/image/${this.uploadedImageId}`
        );
        log.success("Uploaded image deleted from MongoDB");
      } catch (error) {
        log.warning("Could not delete uploaded image from MongoDB");
      }
    }
  }

  async runTests() {
    log.info("🚀 Starting Integration Tests for Image Upload Component");
    console.log("=".repeat(60));

    const tests = [
      { name: "Service Availability", fn: () => this.checkServices() },
      { name: "Image Upload", fn: () => this.testImageUpload() },
      { name: "Image Retrieval", fn: () => this.testImageRetrieval() },
      {
        name: "Property Listing with Images",
        fn: () => this.testPropertyListingWithImages(),
      },
      { name: "Chat Query", fn: () => this.testChatQuery() },
      { name: "Image Proxy", fn: () => this.testImageProxy() },
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      console.log(`\n📋 Running: ${test.name}`);
      try {
        const result = await test.fn();
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        log.error(`Test "${test.name}" threw an error: ${error.message}`);
        failed++;
      }
    }

    console.log("\n" + "=".repeat(60));
    log.info("🏁 Integration Test Results:");
    log.success(`✓ Passed: ${passed}`);
    if (failed > 0) {
      log.error(`✗ Failed: ${failed}`);
    }

    if (failed === 0) {
      log.success(
        "🎉 All integration tests passed! The image upload component is working correctly."
      );
    } else {
      log.warning("⚠ Some tests failed. Please check the logs above.");
    }

    await this.cleanup();
  }
}

// Run the tests
if (require.main === module) {
  const tester = new IntegrationTester();
  tester.runTests().catch((error) => {
    log.error(`Integration test failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = IntegrationTester;
