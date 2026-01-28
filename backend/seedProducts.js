const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

// Load env vars
dotenv.config();

const products = [
    // Rings
    {
        name: 'Ethereal Diamond Ring',
        price: 1250,
        description: 'A stunning solitaire diamond ring set in 18k white gold. Perfect for engagements or a special gift.',
        category: 'rings',
        inStock: true,
        image: 'Ethereal Diamond Ring.jpg',
        rating: 4.8,
        numReviews: 12
    },
    // Necklaces
    {
        name: 'Pearl Drop Necklace',
        price: 450,
        description: 'Elegant freshwater pearl suspended from a delicate gold chain. A classic piece for any wardrobe.',
        category: 'necklaces',
        inStock: true,
        image: 'Pearl Drop Necklace.jpg',
        rating: 4.9,
        numReviews: 25
    },
    // Earrings
    {
        name: 'Crystal Stud Earrings',
        price: 85,
        description: 'Sparkling crystal studs perfect for everyday wear. Simple yet elegant.',
        category: 'earrings',
        inStock: true,
        image: 'Crystal Stud Earrings.jpg',
        rating: 4.5,
        numReviews: 30
    },
    // Bracelets
    {
        name: 'Charm Bracelet',
        price: 200,
        description: 'A playful charm bracelet with customisable charms to tell your unique story.',
        category: 'bracelets',
        inStock: true,
        image: 'Charm Bracelet.jpg',
        rating: 4.4,
        numReviews: 10
    },
    // Watches
    {
        name: 'Classic Leather Watch',
        price: 350,
        description: 'A sophisticated watch with a genuine leather strap and a minimalist dial.',
        category: 'watches',
        inStock: true,
        image: 'Classic Leather Watch.jpg',
        rating: 4.6,
        numReviews: 18
    }
];

const seedDB = async () => {
    try {
        // Connect strictly using the URI
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Product.deleteMany({});
        console.log('🗑️  Deleted existing products');

        // Insert new data
        await Product.insertMany(products);
        console.log(`🌱 Added ${products.length} sample products`);

        process.exit();
    } catch (err) {
        console.error('❌ Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();
