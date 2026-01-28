import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import FooterSection from '../components/FooterSection';
import api from '../api/axios';
import { Loader, Package, Calendar, IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MyOrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                // Based on backend route: /api/v1/orders/myorders
                const response = await api.get('/orders/myorders');
                setOrders(response.data.orders || response.data.data.orders || []);
            } catch (err) {
                console.error("Fetch orders failed:", err);
                setError("Failed to load your orders.");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    return (
        <>
            <Header />
            <main className="min-h-screen bg-cream pt-28 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-serif text-darkBrown mb-8">Order History</h1>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader className="w-10 h-10 text-darkBrown animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                            <p className="text-red-500">{error}</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900">No orders yet</h3>
                            <p className="text-gray-500 mt-2">Start shopping to create your first order.</p>
                            <a href="/shop" className="inline-block mt-6 px-6 py-2 bg-darkBrown text-cream rounded hover:bg-opacity-90 transition">
                                Browse Shop
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order._id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center text-sm">
                                        <div className="space-y-1">
                                            <p className="text-gray-500 flex items-center gap-2">
                                                <Calendar className="w-4 h-4" /> Order Date
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-gray-500 flex items-center gap-2">
                                                <IndianRupee className="w-4 h-4" /> Total Amount
                                            </p>
                                            <p className="font-medium text-gray-900">₹{order.totalPrice}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-gray-500 flex items-center gap-2">
                                                Status
                                            </p>
                                            <div className="flex flex-col items-start gap-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {order.isPaid ? 'Paid' : 'Unpaid'}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${(order.orderStatus === 'Delivered' || order.isDelivered) ? 'bg-green-100 text-green-800' :
                                                        order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                            order.orderStatus === 'Packed' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {order.orderStatus || (order.isDelivered ? 'Delivered' : 'Processing')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 text-right">
                                            <span className="text-xs text-gray-400 font-mono">ID: {order._id}</span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <ul className="divide-y divide-gray-100">
                                            {/* Order items structure depends on backend, assuming it populates product */}
                                            {order.orderItems && order.orderItems.map((item, idx) => (
                                                <li key={idx} className="py-4 flex gap-4 items-center">
                                                    {/* Fallback for missing image/product data if backend just stores ID */}
                                                    {item.product && typeof item.product === 'object' ? (
                                                        <>
                                                            <img
                                                                src={item.product.imageCover || 'https://via.placeholder.com/60'}
                                                                alt={item.product.name}
                                                                className="w-16 h-16 object-cover rounded bg-gray-100"
                                                            />
                                                            <div>
                                                                <h4 className="font-medium text-darkBrown">{item.product.name}</h4>
                                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div>
                                                            <h4 className="font-medium text-darkBrown">{item.name || "Product Name Unavailable"}</h4>
                                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <FooterSection />
        </>
    );
}
