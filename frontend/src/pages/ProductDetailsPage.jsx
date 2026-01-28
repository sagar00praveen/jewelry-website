import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import FooterSection from '../components/FooterSection';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Loader, Minus, Plus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data.data.product);

                // Fetch related products
                if (response.data.data.product) {
                    const category = response.data.data.product.category;

                    // Try to get products in same category
                    const relatedResponse = await api.get(`/products?category=${category}`);
                    let allRelated = relatedResponse.data.data.products.filter(p => p._id !== id);

                    // Fallback: If we don't have enough related products (minimum 4), fetch more from general list
                    if (allRelated.length < 4) {
                        try {
                            // Fetch more products to fill the gap. 
                            // We fetch 8 to have a buffer in case of duplicates or same category ones we already have
                            const generalResponse = await api.get(`/products?limit=8`);
                            const generalProducts = generalResponse.data.data.products;

                            // Create a Set of existing IDs to avoid duplicates
                            const existingIds = new Set(allRelated.map(p => p._id));
                            existingIds.add(id); // Don't include current product

                            for (const product of generalProducts) {
                                if (allRelated.length >= 4) break;
                                if (!existingIds.has(product._id)) {
                                    allRelated.push(product);
                                    existingIds.add(product._id);
                                }
                            }
                        } catch (fallbackErr) {
                            console.warn("Retrying fetch for related products failed", fallbackErr);
                        }
                    }

                    setRelatedProducts(allRelated.slice(0, 4));
                }

            } catch (err) {
                console.error("Product fetch error:", err);
                setError("Product not found");
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            // Optional: Show toast notification?
            // For now, simple alert or just redirect to cart (or stay and show added feedback, I'll stick to simple logic for now)
            alert("Added to cart!");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-cream flex justify-center items-center">
            <Loader className="w-10 h-10 text-darkBrown animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-cream flex flex-col justify-center items-center space-y-4">
            <p className="text-red-500 text-lg">{error}</p>
            <button onClick={() => navigate('/shop')} className="text-darkBrown underline">Back to Shop</button>
        </div>
    );

    return (
        <>
            <Header />
            <main className="min-h-screen bg-cream pt-28 pb-16 px-4">
                <div className="max-w-6xl mx-auto">

                    <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-darkBrown mb-8 transition">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                        {/* Image Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="bg-white rounded-xl shadow-sm overflow-hidden"
                        >
                            {/* Fallback image if product.image is undefined or broken URL handling could go here */}
                            <img
                                src={product.image ? (product.image.startsWith('http') ? product.image : `/assets/${product.image}`) : 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=2574&auto=format&fit=crop'}
                                alt={product.name}
                                className="w-full h-auto object-cover rounded-lg aspect-square"
                            />
                        </motion.div>

                        {/* Details Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="space-y-8"
                        >
                            <div>
                                <h1 className="text-4xl font-serif text-darkBrown mb-2">{product.name}</h1>
                                <p className="text-xl font-medium text-khaki">₹{product.price.toLocaleString('en-IN')}</p>
                            </div>

                            <p className="text-gray-600 leading-relaxed">
                                {product.description || "A beautiful piece of jewelry designed to elevate your style. Ethically sourced and handcrafted with precision."}
                            </p>

                            <div className="pt-6 border-t border-gray-200">
                                <div className="flex items-center space-x-6 mb-8">
                                    <div className="flex items-center border border-darkBrown rounded-md">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="p-3 text-darkBrown hover:bg-pale-yellow/20 transition"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="px-4 font-medium text-darkBrown">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="p-3 text-darkBrown hover:bg-pale-yellow/20 transition"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <span className="text-sm text-gray-500">{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            if (!user) {
                                                navigate('/login');
                                                return;
                                            }
                                            handleAddToCart();
                                        }}
                                        disabled={!product.inStock}
                                        className="flex-1 bg-[var(--color-dark-brown)] text-[var(--color-cream)] py-4 rounded-md font-medium tracking-wide hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                                    >
                                        {product.inStock ? "Add to Cart" : "Sold Out"}
                                    </button>

                                    {product.inStock && (
                                        <button
                                            onClick={() => {
                                                if (!user) {
                                                    navigate('/login');
                                                    return;
                                                }
                                                addToCart(product, quantity);
                                                navigate('/cart');
                                            }}
                                            className="flex-1 border border-[var(--color-dark-brown)] text-[var(--color-dark-brown)] py-4 rounded-md font-medium tracking-wide hover:bg-[var(--color-dark-brown)] hover:text-[var(--color-cream)] transition uppercase"
                                        >
                                            Buy Now
                                        </button>
                                    )}
                                </div>
                            </div>


                        </motion.div>
                    </div>

                    {/* Related Products Section */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-24">
                            <h2 className="text-3xl font-serif text-darkBrown mb-12 text-center">You May Also Like</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {relatedProducts.map((relatedProduct) => (
                                    <ProductCard key={relatedProduct._id} product={relatedProduct} />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </main>
            <FooterSection />
        </>
    );
}
