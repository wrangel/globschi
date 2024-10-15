import mongoose from "mongoose";

// Connect to Mongo DB

const connectDB = async () => {
  try {
    // Configure Mongoose options

    mongoose.options.strictQuery = false;

    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.APP_DB_PASSWORD}@${process.env.SERVER}/${process.env.DB}?retryWrites=true&w=majority`
    );

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);

    throw error;
  }
};

// Create Mongoose Island Schema
const islandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    required: true,
    type: String,
  },
  author: {
    type: String,
    required: true,
  },
  dateTimeString: {
    required: true,
    type: String,
  },
  dateTime: {
    required: true,
    type: Date,
  },
  latitude: {
    required: true,
    type: Number,
  },
  longitude: {
    required: true,
    type: Number,
  },
  altitude: {
    required: true,
    type: Number,
  },
  country: {
    required: true,
    type: String,
  },
  region: {
    required: true,
    type: String,
  },
  location: {
    required: true,
    type: String,
  },
  postalCode: {
    type: String,
  },
  road: String,
  noViews: {
    required: true,
    type: Number,
    min: 0,
  },
});

// Create Mongoose Island Model
const Island = mongoose.model("Island", islandSchema);

export { connectDB, Island };
