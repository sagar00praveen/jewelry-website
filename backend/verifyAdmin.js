const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const verifyAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('DB Connected');

        const email = 'admin@gmail.com';
        const password = '12345678';

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('❌ Admin user NOT FOUND in database.');
            process.exit(1);
        }

        console.log(`✅ Admin user found: ${user.email}, Role: ${user.role}`);

        const isMatch = await user.correctPassword(password, user.password);
        if (isMatch) {
            console.log('✅ Password Match: SUCCESS');
        } else {
            console.log('❌ Password Match: FAILED');
            console.log('Ensure the seed script ran correctly and hashed the password.');
        }

        process.exit();

    } catch (error) {
        console.error('Error verifying admin:', error);
        process.exit(1);
    }
};

verifyAdmin();
