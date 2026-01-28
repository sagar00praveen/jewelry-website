const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

console.log("---------------------------------------------------");
console.log("Testing MongoDB Connection...");
console.log("URI:", uri ? uri.replace(/:([^:@]+)@/, ':****@') : "UNDEFINED"); // Mask password
console.log("---------------------------------------------------");

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Fail fast (5 seconds)
    socketTimeoutMS: 45000,
})
    .then(() => {
        console.log("✅ SUCCESS: Connected to MongoDB!");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ ERROR: Connection Failed");
        console.error("Name:", err.name);
        console.error("Message:", err.message);
        console.error("Code:", err.code);
        if (err.cause) console.error("Cause:", err.cause);

        console.log("---------------------------------------------------");
        console.log("POSSIBLE CAUSES:");
        console.log("1. Firewall/Antivirus blocking Port 27017.");
        console.log("2. VPN interfering with the connection.");
        console.log("3. DNS Resolution failure.");
        console.log("---------------------------------------------------");
        process.exit(1);
    });
