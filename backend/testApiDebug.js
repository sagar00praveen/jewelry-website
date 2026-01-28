const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');

dotenv.config({ path: './.env' });

const testApiCall = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Find an order that is NOT delivered
        // If all are delivered, create one or update one to processing
        let order = await Order.findOne({ isDelivered: false });

        if (!order) {
            console.log("No non-delivered orders found. Creating/Finding one to reset...");
            // Just grab any order and reset it for testing
            order = await Order.findOne();
            if (!order) { console.log("No orders at all."); return; }
            order.isDelivered = false;
            order.orderStatus = 'Processing';
            await order.save();
            console.log(`Reset order ${order._id} to Processing.`);
        }

        const orderId = order._id.toString();

        // 1. Login
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

        // 2. Put - Should FAIL because order is not delivered
        console.log(`Attempting to update payment for NON-DELIVERED order ${orderId}...`);
        const updateRes = await fetch(`http://localhost:5001/api/v1/orders/${orderId}/deliver`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isPaid: true })
        });

        console.log("Update Status:", updateRes.status);
        const updateData = await updateRes.json();
        console.log("Update Response:", JSON.stringify(updateData, null, 2));

        if (updateRes.status === 400 && updateData.message.includes('delivered orders')) {
            console.log("SUCCESS: Blocked update on non-delivered order.");
        } else {
            console.error("FAILURE: Should have blocked update.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

testApiCall();
