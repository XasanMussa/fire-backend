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

// // GET /api/sensor-logs
// app.get("/api/sensor-logs", async (req, res) => {
//   try {
//     const { start, end, page = 1, sort = "desc" } = req.query;
//     const PAGE_SIZE = 10;
//     const offset = (parseInt(page) - 1) * PAGE_SIZE;
//     const order = sort === "asc" ? "ASC" : "DESC";

//     // Count total
//     const [countRows] = await pool.execute(
//       `SELECT COUNT(*) as total FROM SensorLogs WHERE timestamp BETWEEN ? AND ?`,
//       [start, end]
//     );
//     const total = countRows[0].total;

//     // Get paginated logs
//     const [rows] = await pool.execute(
//       `SELECT id, timestamp, fire_detected, gas_detected, emergency_triggered, pump_status
//        FROM SensorLogs
//        WHERE timestamp BETWEEN ? AND ?
//        ORDER BY timestamp ${order}
//        LIMIT ? OFFSET ?`,
//       [start, end, PAGE_SIZE, offset]
//     );

//     res.json({ data: rows, total });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Database error" });
//   }
// });

// GET /api/sensor-logs/summary
// app.get("/api/sensor-logs/summary", async (req, res) => {
//   try {
//     const { start, end } = req.query;
//     const [rows] = await pool.execute(
//       `SELECT
//         SUM(fire_detected) AS fire,
//         SUM(gas_detected) AS gas,
//         SUM(emergency_triggered) AS emergency
//       FROM SensorLogs
//       WHERE timestamp BETWEEN ? AND ?`,
//       [start, end]
//     );
//     res.json({
//       fire: Number(rows[0].fire) || 0,
//       gas: Number(rows[0].gas) || 0,
//       emergency: Number(rows[0].emergency) || 0,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Database error" });
//   }
// });

// // GET /api/sensor-logs/aggregate
// app.get("/api/sensor-logs/aggregate", async (req, res) => {
//   try {
//     const { start, end, interval = "hour" } = req.query;
//     let groupBy, dateFormat;
//     if (interval === "day") {
//       groupBy = "DATE(timestamp)";
//       dateFormat = "%Y-%m-%d";
//     } else {
//       groupBy = "DATE(timestamp), HOUR(timestamp)";
//       dateFormat = "%Y-%m-%dT%H:00:00";
//     }
//     const [rows] = await pool.execute(
//       `SELECT
//         DATE_FORMAT(timestamp, ?) as timestamp,
//         SUM(fire_detected) AS fire,
//         SUM(gas_detected) AS gas,
//         SUM(emergency_triggered) AS emergency
//       FROM SensorLogs
//       WHERE timestamp BETWEEN ? AND ?
//       GROUP BY ${groupBy}
//       ORDER BY timestamp ASC`,
//       [dateFormat, start, end]
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Database error" });
//   }
// });

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
