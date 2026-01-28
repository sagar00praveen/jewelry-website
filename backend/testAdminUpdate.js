const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');

dotenv.config({ path: './.env' });

const testAdminUpdate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // 1. Find an order
        const order = await Order.findOne();
        if (!order) {
            console.log("No orders found.");
            return;
        }
        console.log(`Testing with Order ID: ${order._id}`);
        console.log(`Initial Payment Status: ${order.isPaid}`);

        // 2. Toggle Payment Status (Simulate Admin Action)
        const newStatus = !order.isPaid;
        console.log(`Setting Payment Status to: ${newStatus}`);

        // Emulate controller logic
        order.isPaid = newStatus;
        if (newStatus) {
            order.paidAt = order.paidAt || Date.now();
        } else {
            order.paidAt = undefined;
            order.paymentResult = undefined;
        }
        await order.save();

        // 3. Verify
        const updatedOrder = await Order.findById(order._id);
        console.log(`Updated Payment Status: ${updatedOrder.isPaid}`);

        if (updatedOrder.isPaid === newStatus) {
            console.log("SUCCESS: Payment status updated correctly.");
        } else {
            console.error("FAILURE: Payment status did not update.");
        }

        // Revert changes
        console.log("Reverting changes...");
        updatedOrder.isPaid = !newStatus;
        if (!newStatus) {
            updatedOrder.paidAt = Date.now();
        } else {
            updatedOrder.paidAt = undefined;
            updatedOrder.paymentResult = undefined;
        }
        await updatedOrder.save();
        console.log("Reverted.");


    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

testAdminUpdate();
