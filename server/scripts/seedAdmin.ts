import mongoose from "mongoose";
import User from "../src/models/User.model";
import { hashPassword } from "../src/utils/password";

const MONGO_URI = process.env.MONGO_URI ?? "";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

async function seed(): Promise<void> {
  if (!MONGO_URI) throw new Error("MONGO_URI is not set");
  if (!ADMIN_EMAIL) throw new Error("ADMIN_EMAIL is not set");
  if (!ADMIN_PASSWORD) throw new Error("ADMIN_PASSWORD is not set");

  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const hashed = await hashPassword(ADMIN_PASSWORD);
  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (existing) {
    existing.name = ADMIN_NAME;
    existing.role = "admin";
    existing.password = hashed;
    await existing.save();
    console.log(`Admin updated: ${ADMIN_EMAIL}`);
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashed,
      role: "admin",
    });
    console.log(`Admin created: ${ADMIN_EMAIL}`);
  }

  await mongoose.disconnect();
  console.log("Done");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
