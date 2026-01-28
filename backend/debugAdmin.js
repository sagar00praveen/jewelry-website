const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const debugAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('DB Connected');

        const email = 'admin@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found.');
        } else {
            console.log('User found:', user.toObject());
            user.password = '12345678';
            try {
                await user.save();
                console.log('Saved successfully');
            } catch (saveError) {
                console.error('Save failed!');
                if (saveError.errors) {
                    Object.keys(saveError.errors).forEach(key => {
                        console.error(`Validation Error on [${key}]: ${saveError.errors[key].message}`);
                        console.error(`Value: ${saveError.errors[key].value}`);
                    });
                } else {
                    console.error(saveError);
                }
            }
        }

        process.exit();
    } catch (error) {
        console.error('General Error:', error);
        process.exit(1);
    }
};

debugAdmin();
