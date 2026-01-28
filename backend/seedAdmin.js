const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('DB Connected');

        const adminData = {
            name: 'Admin User',
            email: 'admin@gmail.com',
            password: '12345678',
            role: 'admin',
            phone: '1234567890',
            privateKey: '123456789012',
            address: {
                street: 'Admin St',
                city: 'Admin City',
                state: 'State',
                postalCode: '00000',
                country: 'Country'
            }
        };

        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('Admin user already exists. Deleting to ensure clean state...');
            await User.findOneAndDelete({ email: adminData.email });
        }

        await User.create(adminData);
        console.log('Admin user created successfully.');

        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error.message);
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
