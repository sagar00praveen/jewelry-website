import React, { useState } from 'react';
import Header from '../components/Header';
import FooterSection from '../components/FooterSection';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, X, CreditCard, Banknote, MapPin, QrCode } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
    const [loading, setLoading] = useState(false);

    // Form Data
    const [address, setAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'card'
    const [transactionId, setTransactionId] = useState('');

    const handleAddressChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handleOrderClick = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setIsModalOpen(true);
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        if (step === 2 && paymentMethod === 'card' && !transactionId.trim()) {
            alert("Please provide the Transaction ID to verify your payment.");
            return;
        }
        setStep(step + 1);
    };

    const handleBackStep = () => {
        setStep(step - 1);
    };

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            // Calculate totals
            const itemsPrice = cartTotal;
            const shippingPrice = 0; // Free shipping logic
            const taxPrice = 0; // Simplified tax logic
            const totalPrice = itemsPrice + shippingPrice + taxPrice;

            // Construct payload matching backend expectation
            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    qty: item.quantity, // Controller uses 'qty' for stock updates
                    price: item.price,
                    imageId: item.imageCover || item.image // Use fallback
                })),
                shippingAddress: address,
                paymentMethod: paymentMethod,
                paymentResult: paymentMethod === 'card' ? {
                    id: transactionId,
                    status: 'pending_verification',
                    update_time: new Date().toISOString(),
                    email_address: user.email
                } : {},
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice
            };

            await api.post('/orders', orderData);

            clearCart();
            setIsModalOpen(false);
            alert("Order placed successfully!");
            navigate('/myorders');

        } catch (error) {
            console.error("Checkout failed:", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-cream flex flex-col justify-center items-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center space-y-6 max-w-md"
                    >
                        <div className="bg-white p-6 rounded-full inline-block shadow-sm">
                            <ShoppingBag className="w-12 h-12 text-khaki" />
                        </div>
                        <h1 className="text-3xl font-serif text-darkBrown">Your Cart</h1>
                        <p className="text-gray-500">It looks like you haven't added any pieces to your collection yet.</p>
                        <a href="/shop" className="inline-block px-8 py-3 bg-darkBrown text-cream rounded-md hover:bg-khaki transition duration-300 tracking-wide font-medium">
                            CONTINUE SHOPPING
                        </a>
                    </motion.div>
                </main>
                <FooterSection />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-cream pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-serif text-darkBrown mb-8">Shopping Cart</h1>

                    <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                        {/* Cart Items List */}
                        <div className="lg:col-span-8 space-y-6">
                            <AnimatePresence>
                                {cartItems.map((item) => {
                                    // Logic to determine image URL matching ProductCard
                                    const imageFilename = item.image;
                                    const imageUrl = item.imageCover || (imageFilename && (imageFilename.startsWith('http') || imageFilename.startsWith('/'))
                                        ? imageFilename
                                        : imageFilename
                                            ? `/assets/${imageFilename}`
                                            : 'https://via.placeholder.com/150');

                                    return (
                                        <motion.div
                                            key={item._id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="bg-white p-6 rounded-lg shadow-sm flex flex-col sm:flex-row items-center gap-6 overflow-hidden"
                                        >
                                            <img
                                                src={imageUrl}
                                                alt={item.name}
                                                className="w-24 h-24 object-cover rounded-md"
                                            />

                                            <div className="flex-1 text-center sm:text-left">
                                                <h3 className="text-lg font-medium text-darkBrown">{item.name}</h3>
                                                <p className="text-khaki font-medium mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center border border-gray-200 rounded">
                                                    <button
                                                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                        className="p-2 hover:bg-gray-50 text-darkBrown"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                        className="p-2 hover:bg-gray-50 text-darkBrown"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item._id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-4 mt-8 lg:mt-0">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-white p-6 rounded-lg shadow-sm sticky top-28"
                            >
                                <h2 className="text-xl font-serif text-darkBrown mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span>Free</span>
                                    </div>
                                    <div className="border-t pt-4 flex justify-between font-medium text-lg text-darkBrown">
                                        <span>Total</span>
                                        <span>₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleOrderClick}
                                    className="w-auto px-10 mx-auto bg-[var(--color-dark-brown)] text-[var(--color-cream)] py-3 rounded-md hover:opacity-90 transition flex justify-center items-center gap-2 font-medium"
                                >
                                    ORDER NOW <ArrowRight className="w-4 h-4" />
                                </button>
                                <p className="text-xs text-center text-gray-400 mt-4">Safe & Secure Checkout</p>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* ORDER MODAL */}
                <AnimatePresence>
                    {isModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                            >

                                {/* Modal Header */}
                                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                    <h2 className="text-lg font-bold text-darkBrown">
                                        {step === 1 && "Shipping Details"}
                                        {step === 2 && "Payment Method"}
                                        {step === 3 && "Confirm Order"}
                                    </h2>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-darkBrown">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="p-6 overflow-y-auto flex-1">

                                    {/* STEP 1: Address */}
                                    {step === 1 && (
                                        <form id="address-form" onSubmit={handleNextStep} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                                <input
                                                    required
                                                    name="address"
                                                    value={address.address}
                                                    onChange={handleAddressChange}
                                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-darkBrown focus:border-transparent outline-none"
                                                    placeholder="123 Jewelry Lane"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                    <input
                                                        required
                                                        name="city"
                                                        value={address.city}
                                                        onChange={handleAddressChange}
                                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-darkBrown focus:border-transparent outline-none"
                                                        placeholder="New York"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                                    <input
                                                        required
                                                        name="postalCode"
                                                        value={address.postalCode}
                                                        onChange={handleAddressChange}
                                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-darkBrown focus:border-transparent outline-none"
                                                        placeholder="10001"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                                <input
                                                    required
                                                    name="country"
                                                    value={address.country}
                                                    onChange={handleAddressChange}
                                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-darkBrown focus:border-transparent outline-none"
                                                    placeholder="United States"
                                                />
                                            </div>
                                        </form>
                                    )}

                                    {/* STEP 2: Payment */}
                                    {step === 2 && (
                                        <div className="space-y-4">
                                            <p className="text-gray-600 mb-4">Select your preferred payment method:</p>

                                            <div
                                                className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between transition-all ${paymentMethod === 'card' ? 'border-[var(--color-dark-brown)] bg-amber-50 ring-1 ring-[var(--color-dark-brown)]' : 'border-gray-200 hover:border-[var(--color-dark-brown)]'}`}
                                                onClick={() => setPaymentMethod('card')}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gray-100 p-2 rounded-full"><CreditCard className="w-5 h-5 text-[var(--color-dark-brown)]" /></div>
                                                    <span className="font-medium">Online Payment</span>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full border ${paymentMethod === 'card' ? 'bg-[var(--color-dark-brown)] border-[var(--color-dark-brown)]' : 'border-gray-300'}`}></div>
                                            </div>

                                            <div
                                                className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between transition-all ${paymentMethod === 'cash' ? 'border-[var(--color-dark-brown)] bg-amber-50 ring-1 ring-[var(--color-dark-brown)]' : 'border-gray-200 hover:border-[var(--color-dark-brown)]'}`}
                                                onClick={() => setPaymentMethod('cash')}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gray-100 p-2 rounded-full"><Banknote className="w-5 h-5 text-green-700" /></div>
                                                    <span className="font-medium">Cash on Delivery</span>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full border ${paymentMethod === 'cash' ? 'bg-[var(--color-dark-brown)] border-[var(--color-dark-brown)]' : 'border-gray-300'}`}></div>
                                            </div>

                                            {paymentMethod === 'card' && (
                                                <>
                                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center animate-in fade-in zoom-in duration-300">
                                                        <p className="text-sm text-gray-500 mb-3">Scan QR Code to Pay</p>
                                                        {/* Placeholder for QR Code */}
                                                        <div className="mx-auto w-48 h-48 bg-white border border-gray-200 rounded-lg flex items-center justify-center mb-3">
                                                            <QrCode className="w-32 h-32 text-darkBrown opacity-80" />
                                                        </div>
                                                        <p className="text-xs text-gray-400">Secure Payment via UPI/Banking App</p>
                                                    </div>
                                                    <div className="mt-4">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID (Required)</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            value={transactionId}
                                                            onChange={(e) => setTransactionId(e.target.value)}
                                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[var(--color-dark-brown)] focus:border-transparent outline-none"
                                                            placeholder="Enter UPI / Bank Transaction ID"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* STEP 3: Review */}
                                    {step === 3 && (
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Deliver to:</span>
                                                    <span className="font-medium text-right">{address.address}, {address.city}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Payment:</span>
                                                    <span className="font-medium capitalize">{paymentMethod === 'card' ? 'Online Payment' : 'Cash on Delivery'}</span>
                                                </div>
                                            </div>

                                            <div className="border-t pt-4">
                                                <div className="flex justify-between text-lg font-bold text-darkBrown">
                                                    <span>Total Amount</span>
                                                    <span>₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>

                                            <div className="bg-blue-50 text-blue-700 p-3 rounded text-sm">
                                                <p>By placing this order, you agree to our Terms of Service and Privacy Policy.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                                    {step > 1 ? (
                                        <button
                                            onClick={handleBackStep}
                                            className="px-4 py-2 text-gray-600 hover:text-darkBrown font-medium"
                                        >
                                            Back
                                        </button>
                                    ) : (
                                        <div></div> // Spacer
                                    )}

                                    {step < 3 ? (
                                        <button
                                            onClick={step === 1 ? () => document.getElementById('address-form').requestSubmit() : handleNextStep}
                                            className="px-6 py-2 bg-[var(--color-dark-brown)] text-[var(--color-cream)] rounded-md hover:opacity-90 transition font-medium"
                                        >
                                            Next
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={loading}
                                            className="px-6 py-2 bg-[var(--color-dark-brown)] text-[var(--color-cream)] rounded-md hover:opacity-90 transition font-medium flex items-center gap-2 disabled:opacity-70"
                                        >
                                            {loading ? 'Processing...' : 'Confirm Order'}
                                        </button>
                                    )}
                                </div>

                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            <FooterSection />
        </>
    );
}
