const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config({ path: './.env' });

const debugProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const products = await Product.find({}, 'name category _id');
        console.log("Total products:", products.length);
        console.log(JSON.stringify(products, null, 2));

        // Group by category to see counts
        const categoryCounts = {};
        products.forEach(p => {
            const cat = p.category || "Uncategorized";
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        console.log("Category counts:", categoryCounts);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

debugProducts();
