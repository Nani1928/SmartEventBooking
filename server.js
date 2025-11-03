const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "eventdb"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL (eventdb)");
  }
});

// ------------------------- SIGNUP -------------------------
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required!" });

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, password], (err) => {
    if (err) {
      console.error("Error inserting user:", err);
      return res.status(500).json({ message: "Signup failed!" });
    }
    res.json({ message: "Signup successful!" });
  });
});

// ------------------------- LOGIN -------------------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required!" });

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error("Error during login:", err);
      return res.status(500).json({ message: "Server error." });
    }
    if (results.length > 0)
      res.json({ success: true, message: "Login successful!" });
    else
      res.status(401).json({ success: false, message: "Invalid credentials!" });
  });
});

// ------------------------- BOOKING -------------------------
app.post("/book-event", (req, res) => {
  const { name, email, eventName, eventDate, city, tickets, total } = req.body;

  if (!name || !email || !eventName || !tickets || !total) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const sql = `
    INSERT INTO bookings (name, email, eventName, eventDate, city, tickets, total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, email, eventName, eventDate, city, tickets, total], (err) => {
    if (err) {
      console.error("Error saving booking:", err);
      return res.status(500).json({ message: "Error saving booking!" });
    }
    res.json({ success: true, message: "Booking saved successfully!" });
  });
});

// ------------------------- PAYMENT -------------------------
app.post("/payment", (req, res) => {
  const {
    name,
    email,
    eventName,
    eventDate,
    city,
    tickets,
    total,
    paymentMethod,
    upiId,
    cardNumber,
    expiryDate,
    cvv
  } = req.body;

  console.log("📥 Received payment data:", req.body);

  if (!name || !email || !eventName || !tickets || !total) {
    console.log("❌ Missing required booking fields");
    return res.status(400).json({ message: "Incomplete booking details." });
  }

  const sql = `
    INSERT INTO bookings 
    (name, email, eventName, eventDate, city, tickets, total, payment_method, upi_id, card_number, expiry_date, cvv)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    email,
    eventName,
    eventDate || null,
    city || null,
    tickets,
    total,
    paymentMethod || null,
    upiId || null,
    cardNumber || null,
    expiryDate || null,
    cvv || null
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Database insert error:", err);
      return res.status(500).json({ message: "Server error inserting booking." });
    }
    console.log("✅ Booking inserted:", result);
    res.json({ message: "Payment successful!" });
  });
});

// ------------------------- DEFAULT PAGE -------------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ------------------------- SERVER START -------------------------
app.listen(port, () => {
  console.log(`🚀 Server running at: http://localhost:${port}`);
});
