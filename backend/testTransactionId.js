const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');
const Product = require('./models/Product');

dotenv.config({ path: './.env' });

const testTransactionId = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Need a valid product ID
        const product = await Product.findOne({ inStock: true });
        if (!product) { console.log("No in-stock product found"); return; }

        // 1. Login as USER to place order (or Admin, doesn't matter for creation usually, but let's use admin for simplicity key)
        // Actually, let's use the admin user I already have details for
        console.log("Logging in...");
        const loginRes = await fetch('http://localhost:5001/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'adminpassword123', privateKey: 'secret_admin_key' })
        });

        if (!loginRes.ok) {
            console.log("Login failed", loginRes.status, await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Got Token");

        // 2. Create Order with Transaction ID
        const fakeTxId = "TXN_" + Date.now();
        console.log(`Creating order with TX ID: ${fakeTxId}...`);

        const orderData = {
            orderItems: [{
                product: product._id,
                name: product.name,
                quantity: 1,
                price: product.price,
                qty: 1
            }],
            shippingAddress: {
                address: "123 Test St",
                city: "Test City",
                postalCode: "12345",
                country: "Test Country"
            },
            paymentMethod: "card",
            itemsPrice: product.price,
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: product.price,
            paymentResult: {
                id: fakeTxId,
                status: "pending_verification",
                update_time: new Date().toISOString(),
                email_address: "admin@example.com"
            }
        };

        const createRes = await fetch('http://localhost:5001/api/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        console.log("Create Status:", createRes.status);
        const createResult = await createRes.json();

        if (createRes.ok) {
            const createdOrder = await Order.findById(createResult.data.order._id);
            console.log("DB Payment Result:", JSON.stringify(createdOrder.paymentResult, null, 2));

            if (createdOrder.paymentResult && createdOrder.paymentResult.id === fakeTxId) {
                console.log("SUCCESS: Transaction ID verified in DB!");
                // Cleanup
                await Order.findByIdAndDelete(createdOrder._id);
                console.log("Cleanup: Test order deleted.");
            } else {
                console.error("FAILURE: Transaction ID missing or incorrect in DB.");
            }
        } else {
            console.log("Create Failed:", JSON.stringify(createResult, null, 2));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

testTransactionId();
