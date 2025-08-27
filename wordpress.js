const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const wpSite = process.env.WP_SITE;
const wpUser = process.env.WP_USER;
const wpAppPassword = process.env.WP_APP_PASSWORD;

// Base64 encode WordPress credentials
const authHeader =
  "Basic " + Buffer.from(`${wpUser}:${wpAppPassword}`).toString("base64");

// --- Upload image to WordPress ---
async function uploadImageToWP(imageUrl, filename = "news-image.jpg") {
  try {
    // Download image
    const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, res.data);

    // Prepare form data
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath), filename);

    // Upload to WordPress
    const uploadRes = await axios.post(
      `${wpSite}/wp-json/wp/v2/media`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: authHeader,
        },
      }
    );

    // Clean up local file
    fs.unlinkSync(filePath);

    console.log(`📸 Uploaded image: ${uploadRes.data.id}`);
    return uploadRes.data.id; // Return media ID
  } catch (err) {
    console.error("❌ Image upload failed:", err.message);
    return null;
  }
}

// --- Create WordPress post ---
async function createWordpressPost(title, content, featuredMediaId = null) {
  try {
    const postData = {
      title,
      content,
      status: "publish", // auto publish
    };

    if (featuredMediaId) {
      postData.featured_media = featuredMediaId;
    }

    const res = await axios.post(`${wpSite}/wp-json/wp/v2/posts`, postData, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    console.log(`📝 Created post: ${res.data.link}`);
    return res.data;
  } catch (err) {
    console.error("❌ Post creation failed:", err.message);
    return null;
  }
}

module.exports = { uploadImageToWP, createWordpressPost };
