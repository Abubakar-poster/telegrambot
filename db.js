const fs = require("fs-extra");

const dbFile = process.env.DB_FILE || "posted.json";

// --- Load database or create new ---
function loadDB() {
  if (!fs.existsSync(dbFile)) {
    return { posted: [] };
  }
  try {
    return fs.readJsonSync(dbFile);
  } catch (err) {
    console.error("❌ Failed to read DB file:", err.message);
    return { posted: [] };
  }
}

// --- Save database ---
function saveDB(db) {
  try {
    fs.writeJsonSync(dbFile, db, { spaces: 2 });
  } catch (err) {
    console.error("❌ Failed to save DB file:", err.message);
  }
}

let db = loadDB();

// --- Check if news is already posted ---
function isPosted(id) {
  return db.posted.includes(id);
}

// --- Mark news as posted ---
function markPosted(id) {
  if (!db.posted.includes(id)) {
    db.posted.push(id);
    saveDB(db);
  }
}

module.exports = { isPosted, markPosted };
