
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

beforeAll(async () => {
  const testUri =
    process.env.TEST_MONGODB_URI ||
    "mongodb://127.0.0.1:27017/waygood_test";

  await mongoose.connect(testUri);
});

afterAll(async () => {
  await mongoose.disconnect();
});
