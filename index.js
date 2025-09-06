require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Error connecting:", err));

// Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
});
const User = mongoose.model("User", UserSchema);

// Routes
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.get("/", (req, res) => {
  res.send("🚀 API is running! Use /users to test.");
});

app.post("/users", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

app.delete("/users", async (req, res) => {
  try {
    await User.deleteMany({});
    res.json({ message: "All users deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Section Controller Schema
const SectionControllerSchema = new mongoose.Schema({
  id: String,
  name: String,
  section: String,
  control_office: String,
});
const SectionController = mongoose.model(
  "SectionController",
  SectionControllerSchema
);

// Station Schema
const StationSchema = new mongoose.Schema({
  code: String,
  name: String,
  section_controller_id: String,
  station_master: {
    id: String,
    name: String,
  },
});
const Station = mongoose.model("Station", StationSchema);

// Train Schema
const TrainSchema = new mongoose.Schema({
  train_no: String,
  name: String,
  route: [String],
  schedule: [
    {
      station: String,
      arrival: String,
      departure: String,
      section_controller_id: String,
    },
  ],
});
const Train = mongoose.model("Train", TrainSchema);

app.post("/api/data", async (req, res) => {
  try {
    const { section_controllers, stations, trains } = req.body;

    // Insert data into each collection
    if (section_controllers)
      await SectionController.insertMany(section_controllers);
    if (stations) await Station.insertMany(stations);
    if (trains) await Train.insertMany(trains);

    res.json({ message: "✅ Data inserted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/data", async (req, res) => {
  try {
    const sectionControllers = await SectionController.find();
    const stations = await Station.find();
    const trains = await Train.find();

    res.json({ sectionControllers, stations, trains });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
