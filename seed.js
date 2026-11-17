require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");
const Item = require("./src/models/Item");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@saiuniversity.edu.in").toLowerCase();
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: process.env.ADMIN_NAME || "Portal Admin",
      email: adminEmail,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@12345", 12),
      role: "admin"
    });
  }

  let demo = await User.findOne({ email: "student.demo@saiuniversity.edu.in" });
  if (!demo) demo = await User.create({
    name: "Demo Student",
    email: "student.demo@saiuniversity.edu.in",
    password: await bcrypt.hash("Student@123", 12)
  });

  if (await Item.countDocuments() === 0) {
    const today = new Date();
    const samples = [
      ["Black Wallet","lost","Personal Items","Black leather wallet with student ID inside","Library",0],
      ["Student ID Card","found","ID Cards","Found an ID card near the main entrance","Main Gate",1],
      ["Blue Water Bottle","lost","Accessories","Blue steel bottle with a small sticker","Cafeteria",1],
      ["Wireless Earbuds","found","Electronics","White earbuds case found after class","Block A",2],
      ["Notebook","lost","Books & Notes","Green notebook with mathematics notes","Classroom 204",2],
      ["Umbrella","found","Accessories","Black folding umbrella","Parking Area",3],
      ["Calculator","lost","Electronics","Scientific calculator, black colour","Lab 2",3],
      ["Spectacles Case","found","Personal Items","Brown spectacles case","Auditorium",4],
      ["USB Drive","lost","Electronics","16GB silver USB drive","Computer Lab",4],
      ["House Keys","found","Personal Items","Two keys with a blue keychain","Sports Ground",5]
    ];
    await Item.insertMany(samples.map((x, i) => ({
      title: x[0], type: x[1], category: x[2], description: x[3],
      location: x[4], itemDate: new Date(today.getTime() - x[5] * 86400000),
      reportedBy: i % 2 ? admin._id : demo._id
    })));
  }
  console.log("Seed complete. Admin:", adminEmail);
  console.log("Demo student: student.demo@saiuniversity.edu.in / Student@123");
  console.log("Change default passwords before public deployment.");
  await mongoose.disconnect();
}
seed().catch(err => { console.error(err); process.exit(1); });
