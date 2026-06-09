const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", require("./routes/productRoutes")); // New
app.use("/api/tanks", require("./routes/tankRoutes"));       // New
app.use("/api/pumps", require("./routes/pumpRoutes"));       // New
app.use("/api/daily-prices", require("./routes/dailyPriceRoutes")); // New
app.use("/api/pump-readings", require("./routes/pumpReadingRoutes")); // New
app.use("/api/settlements", require("./routes/shiftSettlementRoutes")); // New
app.use("/api/tariffs", require("./routes/tariffRoutes"));
app.use("/api/bills", require("./routes/billRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// Test route
app.get("/", (req, res) => {
  res.send("PetroManager Backend Running 🚀");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
