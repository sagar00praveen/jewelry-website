const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config({ path: './.env' });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected");

        const adminEmail = 'admin@example.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            // Check User model for required fields. Assuming name, email, password are basic.
            // Validator error might be due to missing "confirmPassword" if custom validation exists?
            // Or maybe phone number? 

            // Assuming simplified model based on previous file reads or just adding likely fields.
            const admin = await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: 'adminpassword123',
                role: 'admin',
                privateKey: 'secret_admin_key',
                // Add commonly required fields just in case
                phone: '1234567890'
            });
            console.log("Admin created");
        } else {
            console.log("Admin exists, updating...");
            adminExists.role = 'admin';
            adminExists.privateKey = 'secret_admin_key';
            adminExists.password = 'adminpassword123';
            await adminExists.save();
            console.log("Admin updated");
        }

    } catch (e) {
        console.error("Error:", e.message);
        if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
    } finally {
        await mongoose.disconnect();
    }
}

seedAdmin();
