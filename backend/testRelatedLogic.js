const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config({ path: './.env' });

const testLogic = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // 1. Pick a product to be the "current" product
        const allProducts = await Product.find({});
        if (allProducts.length === 0) {
            console.log("No products.");
            return;
        }
        const currentProduct = allProducts[0];
        console.log("Current Product:", currentProduct.name, "| Category:", currentProduct.category, "| ID:", currentProduct._id.toString());
        const id = currentProduct._id.toString();

        // 2. Mimic "Fetch related"
        // In real app: GET /products?category=...
        const category = currentProduct.category;
        const relatedDocs = await Product.find({ category: category });
        // Make them POJOs
        let allRelated = relatedDocs.map(d => d.toObject()).filter(p => p._id.toString() !== id);

        console.log("Initial Related (Same Category):", allRelated.length);

        // 3. Mimic Fallback Logic
        if (allRelated.length < 4) {
            console.log("Applying Fallback...");
            const generalDocs = await Product.find().limit(8);
            const generalProducts = generalDocs.map(d => d.toObject());

            const existingIds = new Set(allRelated.map(p => p._id.toString()));
            existingIds.add(id);

            for (const product of generalProducts) {
                if (allRelated.length >= 4) break;
                if (!existingIds.has(product._id.toString())) {
                    console.log("Adding fallback product:", product.name);
                    allRelated.push(product);
                    existingIds.add(product._id.toString());
                }
            }
        }

        console.log("Final Related Count:", allRelated.length);
        console.log("Final Related Names:", allRelated.map(p => p.name));

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

testLogic();
