import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import FooterSection from '../components/FooterSection';

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Product Form State
    const [productForm, setProductForm] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        countInStock: '',
        image: null
    });
    const [productLoading, setProductLoading] = useState(false);
    const [productMessage, setProductMessage] = useState('');

    const [expandedOrderId, setExpandedOrderId] = useState(null);

    // Fetch Orders
    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const { data } = await api.get('/orders');
            setOrders(data.data.orders);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        if (!window.confirm(`Update order status to ${newStatus}?`)) return;

        try {
            await api.put(`/orders/${orderId}/deliver`, { status: newStatus });
            fetchOrders();
        } catch (error) {
            console.error("Failed to update order", error);
            alert("Failed to update status");
        }
    };

    const updatePaymentStatus = async (orderId, isPaid) => {
        if (!window.confirm(`Mark order as ${isPaid ? 'Paid' : 'Unpaid'}?`)) return;

        try {
            await api.put(`/orders/${orderId}/deliver`, { isPaid });
            fetchOrders();
        } catch (error) {
            console.error("Failed to update payment status", error);
            alert("Failed to update payment status");
        }
    };

    const toggleOrderDetails = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
        } else {
            setExpandedOrderId(orderId);
        }
    };

    // Product Handlers
    const handleProductChange = (e) => {
        if (e.target.name === 'image') {
            setProductForm({ ...productForm, image: e.target.files[0] });
        } else {
            setProductForm({ ...productForm, [e.target.name]: e.target.value });
        }
    };

    const handleCategoryChange = (category) => {
        setProductForm({ ...productForm, category });
    }

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setProductLoading(true);
        setProductMessage('');

        const formData = new FormData();
        formData.append('name', productForm.name);
        formData.append('price', productForm.price);
        formData.append('description', productForm.description);
        formData.append('category', productForm.category);
        formData.append('countInStock', productForm.countInStock);
        if (productForm.image) {
            formData.append('image', productForm.image);
        }

        try {
            await api.post('/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setProductMessage('Product added successfully!');
            setProductForm({
                name: '',
                price: '',
                description: '',
                category: '',
                countInStock: '',
                image: null
            });
            document.getElementById('fileInput').value = "";
        } catch (error) {
            console.error("Failed to add product", error);
            setProductMessage(error.response?.data?.message || 'Failed to add product');
        } finally {
            setProductLoading(false);
        }
    };

    const ORDER_STAGES = ['Processing', 'Packed', 'Shipped', 'Delivered'];
    const CATEGORIES = ['Ring', 'Necklace', 'Earring', 'Bracelet', 'Anklet', 'Set'];

    return (
        <div className="min-h-screen bg-cream font-sans flex flex-col">
            <header className="bg-white shadow p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-serif text-dark-brown font-bold">Admin Dashboard</h1>
                    <div className="text-sm text-gray-500">Welcome, {user?.name}</div>
                </div>
            </header>

            <main className="flex-grow max-w-7xl mx-auto w-full p-6">

                {/* Tabs */}
                <div className="flex space-x-4 mb-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'orders'
                            ? 'border-b-2 border-dark-brown text-dark-brown'
                            : 'text-gray-500 hover:text-dark-brown'
                            }`}
                    >
                        Manage Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'products'
                            ? 'border-b-2 border-dark-brown text-dark-brown'
                            : 'text-gray-500 hover:text-dark-brown'
                            }`}
                    >
                        Add Product
                    </button>
                </div>

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expand</th> */}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loadingOrders ? (
                                        <tr><td colSpan="6" className="px-6 py-4 text-center">Loading...</td></tr>
                                    ) : orders.map((order) => (
                                        <React.Fragment key={order._id}>
                                            <tr
                                                onClick={() => toggleOrderDetails(order._id)}
                                                className={`cursor-pointer transition-colors hover:bg-gray-50 ${expandedOrderId === order._id ? "bg-gray-50" : ""}`}
                                            >
                                                {/* <td className="px-6 py-4 whitespace-nowrap">
                                                    <button onClick={() => toggleOrderDetails(order._id)} className="text-dark-brown font-bold text-xl focus:outline-none">
                                                        {expandedOrderId === order._id ? '-' : '+'}
                                                    </button>
                                                </td> */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{order._id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.user?.name || 'Unknown'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{order.totalPrice}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                            order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                                order.orderStatus === 'Packed' ? 'bg-purple-100 text-purple-800' :
                                                                    'bg-yellow-100 text-yellow-800'}`}>
                                                        {order.orderStatus || (order.isDelivered ? 'Delivered' : 'Processing')}
                                                    </span>
                                                </td>

                                            </tr>
                                            {expandedOrderId === order._id && (
                                                <tr>
                                                    <td colSpan="6" className="px-0">
                                                        <div className="bg-gray-50 p-6 border-b border-gray-200 shadow-inner">

                                                            {/* Status Stepper */}
                                                            <div className="mb-8 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                                                                <h4 className="font-serif font-bold text-dark-brown mb-6">Order Timeline</h4>
                                                                <div className="relative px-4 py-2">
                                                                    {/* Progress Bar Background */}
                                                                    <div className="absolute left-4 right-4 top-1/2 transform -translate-y-1/2 h-1 bg-gray-100 rounded z-0"></div>

                                                                    {/* Progress Bar Active */}
                                                                    <div
                                                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 h-1 bg-dark-brown rounded z-0 transition-all duration-500 ease-in-out"
                                                                        style={{
                                                                            width: `calc(${(ORDER_STAGES.indexOf(order.orderStatus || 'Processing') / (ORDER_STAGES.length - 1)) * 100}% - 2rem)`
                                                                        }}
                                                                    ></div>

                                                                    <div className="flex justify-between relative z-10 w-full">
                                                                        {ORDER_STAGES.map((stage, index) => {
                                                                            const currentStatus = order.orderStatus || 'Processing';
                                                                            const currentIndex = ORDER_STAGES.indexOf(currentStatus);
                                                                            const isCompleted = currentIndex >= index;
                                                                            const isCurrent = currentStatus === stage;

                                                                            return (
                                                                                <div
                                                                                    key={stage}
                                                                                    className="flex flex-col items-center group cursor-pointer"
                                                                                    onClick={() => updateStatus(order._id, stage)}
                                                                                    title={`Set status to ${stage}`}
                                                                                >
                                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white
                                                                                        ${isCompleted
                                                                                            ? 'border-dark-brown text-dark-brown'
                                                                                            : 'border-gray-200 text-gray-300'
                                                                                        }
                                                                                        ${isCurrent ? 'ring-4 ring-khaki/30' : ''}
                                                                                    `}>
                                                                                        {isCompleted ? (
                                                                                            <span className="font-bold">✓</span>
                                                                                        ) : (
                                                                                            <span className="text-sm font-semibold">{index + 1}</span>
                                                                                        )}
                                                                                    </div>
                                                                                    <span className={`mt-2 text-xs font-semibold px-2 py-1 rounded transition-colors 
                                                                                        ${isCurrent ? 'text-dark-brown bg-khaki/20' : isCompleted ? 'text-dark-brown' : 'text-gray-400'}
                                                                                    `}>
                                                                                        {stage}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-6 flex justify-center">
                                                                    <p className="text-xs text-gray-400 italic">Click on a stage icon to update the order status.</p>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div>
                                                                    <h4 className="font-serif font-bold text-dark-brown mb-2">Shipping Information</h4>
                                                                    <p className="text-sm text-gray-600"><span className="font-semibold">Name:</span> {order.user?.name}</p>
                                                                    <p className="text-sm text-gray-600"><span className="font-semibold">Email:</span> {order.userEmail}</p>
                                                                    <p className="text-sm text-gray-600"><span className="font-semibold">Phone:</span> {order.user?.phone}</p>
                                                                    <p className="text-sm text-gray-600 mt-2"><span className="font-semibold">Address:</span></p>
                                                                    <p className="text-sm text-gray-600">
                                                                        {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-serif font-bold text-dark-brown mb-2">Payment Details</h4>
                                                                    <p className="text-sm text-gray-600"><span className="font-semibold">Method:</span> {order.paymentMethod}</p>
                                                                    <div className="flex items-center space-x-2">
                                                                        <p className="text-sm text-gray-600"><span className="font-semibold">Status:</span>
                                                                            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                                {order.isPaid ? 'Paid' : 'Pending'}
                                                                            </span>
                                                                        </p>
                                                                        <button
                                                                            onClick={() => updatePaymentStatus(order._id, !order.isPaid)}
                                                                            disabled={!order.isDelivered}
                                                                            title={!order.isDelivered ? "Order must be delivered to update payment status" : ""}
                                                                            className={`text-xs underline ${!order.isDelivered ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
                                                                        >
                                                                            Mark as {order.isPaid ? 'Unpaid' : 'Paid'}
                                                                        </button>
                                                                    </div>
                                                                    {order.paymentResult && (
                                                                        <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                                                                            <p>Trans ID: {order.paymentResult.id}</p>
                                                                            <p>Time: {order.paymentResult.update_time}</p>
                                                                            <p>Email: {order.paymentResult.email_address}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="mt-6">
                                                                <h4 className="font-serif font-bold text-dark-brown mb-2">Order Items</h4>
                                                                <ul className="divide-y divide-gray-200 bg-white rounded border border-gray-200">
                                                                    {order.orderItems.map((item, idx) => (
                                                                        <li key={idx} className="p-3 flex justify-between items-center">
                                                                            <div className="flex items-center space-x-4">
                                                                                <span className="font-medium text-gray-800">{item.name || 'Product'}</span>
                                                                                <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                                                                            </div>
                                                                            <span className="font-bold text-dark-brown">₹{item.price * item.quantity}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    {!loadingOrders && orders.length === 0 && (
                                        <tr><td colSpan="6" className="px-6 py-4 text-center">No orders found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Add Product Tab */}
                {activeTab === 'products' && (
                    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
                        <h2 className="text-2xl font-serif text-dark-brown mb-6">Add New Product</h2>

                        {productMessage && (
                            <div className={`p-4 rounded mb-6 ${productMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {productMessage}
                            </div>
                        )}

                        <form onSubmit={handleProductSubmit} className="space-y-6">

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={productForm.name}
                                    onChange={handleProductChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-dark-brown focus:border-dark-brown"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        required
                                        value={productForm.price}
                                        onChange={handleProductChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-dark-brown focus:border-dark-brown"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Count In Stock</label>
                                    <input
                                        type="number"
                                        name="countInStock"
                                        required
                                        value={productForm.countInStock}
                                        onChange={handleProductChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-dark-brown focus:border-dark-brown"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {CATEGORIES.map(cat => (
                                        <label key={cat} className="inline-flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat}
                                                checked={productForm.category === cat}
                                                onChange={() => handleCategoryChange(cat)}
                                                className="text-dark-brown focus:ring-dark-brown"
                                            />
                                            <span className="text-sm text-gray-700">{cat}</span>
                                        </label>
                                    ))}
                                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="category"
                                            value="Other"
                                            checked={!CATEGORIES.includes(productForm.category) && productForm.category !== ''}
                                            onChange={() => handleCategoryChange('Other')}
                                            className="text-dark-brown focus:ring-dark-brown"
                                        />
                                        <span className="text-sm text-gray-700">Other</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    required
                                    value={productForm.description}
                                    onChange={handleProductChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-dark-brown focus:border-dark-brown"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Product Image</label>
                                <input
                                    id="fileInput"
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleProductChange}
                                    required
                                    className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-dark-brown file:text-white
                    hover:file:bg-khaki transition
                  "
                                />
                                <p className="mt-1 text-xs text-gray-500">Image will be renamed to product name and saved.</p>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={productLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-dark-brown hover:bg-khaki focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-brown disabled:opacity-50"
                                >
                                    {productLoading ? 'Adding Product...' : 'Add Product'}
                                </button>
                            </div>

                        </form>
                    </div>
                )}
            </main>

            <FooterSection />
        </div>
    );
}
