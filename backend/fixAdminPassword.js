const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const fixAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('DB Connected');

        const email = 'admin@gmail.com';
        const password = '12345678';

        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ Admin user NOT FOUND. Creating...');
            await User.create({
                name: 'Admin User',
                email: email,
                password: password,
                role: 'admin',
                phone: '1234567890'
            });
            console.log('✅ Admin user CREATED.');
        } else {
            console.log(`Found user: ${user.email}. Updating password...`);
            user.password = password;
            user.role = 'admin'; // Ensure role is admin
            await user.save();
            console.log('✅ Password UPDATED and Hashed.');
        }

        process.exit();

    } catch (error) {
        console.error('Error fixing admin:', error);
        process.exit(1);
    }
};

fixAdmin();
