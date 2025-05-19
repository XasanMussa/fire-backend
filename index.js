import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// API routes will go here

app.get("/", (req, res) => {
  res.send("Fire & Gas Detection System API");
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM sensor_logs");
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Database  error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/notifications-db", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM notifications");
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Database notifications error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/notifications-db/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM notifications WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /upload-sensor-data
app.post("/upload-sensor-data", async (req, res) => {
  try {
    const { fire_detected, gas_detected, emergency_triggered, pump_status } =
      req.body;

    if (
      fire_detected === undefined ||
      gas_detected === undefined ||
      emergency_triggered === undefined ||
      pump_status === undefined
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    // Get the last inserted record to check if data changed
    const [lastRows] = await pool.execute(
      "SELECT fire_detected, gas_detected, emergency_triggered, pump_status FROM sensor_logs ORDER BY id DESC LIMIT 1"
    );
    const lastRecord = lastRows[0];

    // Compare with last record, if same, skip insert
    if (
      lastRecord &&
      lastRecord.fire_detected === fire_detected &&
      lastRecord.gas_detected === gas_detected &&
      lastRecord.emergency_triggered === emergency_triggered &&
      lastRecord.pump_status === pump_status
    ) {
      return res
        .status(200)
        .json({ success: true, message: "No change detected, not inserted" });
    }

    // Insert new record
    await pool.execute(
      "INSERT INTO sensor_logs (fire_detected, gas_detected, emergency_triggered, pump_status, timestamp) VALUES (?, ?, ?, ?, NOW())",
      [fire_detected, gas_detected, emergency_triggered, pump_status]
    );

    res
      .status(201)
      .json({ success: true, message: "Sensor data inserted successfully" });
  } catch (err) {
    console.error("Upload sensor data error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
