import React, { useState, useEffect } from 'react';
import { FALLBACK_PRODUCTS } from '../data/products';
import Header from '../components/Header';
import FooterSection from '../components/FooterSection';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';
import { Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Watches'];

export default function ShopPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        let isMounted = true;
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            // Set a timeout to show fallback data if backend is slow
            const fallbackTimer = setTimeout(() => {
                if (isMounted && products.length === 0) {
                    // Only use fallback if we don't have products yet
                    console.log("Backend taking time, using fallback data");
                    // Filter by category if needed
                    let localFiltered = FALLBACK_PRODUCTS;
                    if (selectedCategory !== 'All') {
                        localFiltered = FALLBACK_PRODUCTS.filter(p => p.category === selectedCategory.toLowerCase());
                    }
                    setProducts(localFiltered);
                    setLoading(false); // Stop spinner so user sees data
                }
            }, 1500); // 1.5s delay

            try {
                let url = '/products';
                if (selectedCategory !== 'All') {
                    url += `?category=${selectedCategory.toLowerCase()}`;
                }

                const response = await api.get(url);

                if (isMounted) {
                    clearTimeout(fallbackTimer);
                    // Ensure we always have an array
                    setProducts(response.data.data.products || []);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Shop fetch error:", err);
                if (isMounted) {
                    // On true error, also use fallback if not already shown
                    // Filter by category if needed
                    let localFiltered = FALLBACK_PRODUCTS;
                    if (selectedCategory !== 'All') {
                        localFiltered = FALLBACK_PRODUCTS.filter(p => p.category === selectedCategory.toLowerCase());
                    }
                    setProducts(localFiltered);
                    setError(null); // Clear error since we are showing fallback
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProducts();

        return () => {
            isMounted = false;
        };
    }, [selectedCategory]);

    return (
        <>
            <Header />

            <main className="min-h-screen bg-cream pt-24 pb-16 px-4 sm:px-6 lg:px-8">

                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl font-serif text-darkBrown mb-4 tracking-wider">Shop Collections</h1>
                        <p className="text-gray-500 max-w-2xl mx-auto font-sans">
                            Discover our ethically crafted jewelry, designed for the modern muse.
                        </p>
                    </motion.div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {CATEGORIES.map((cat, index) => (
                            <motion.button
                                key={cat}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${selectedCategory === cat
                                        ? 'bg-[var(--color-dark-brown)] text-[var(--color-cream)] shadow-md scale-105'
                                        : 'bg-white text-[var(--color-dark-brown)] border border-gray-200 hover:border-[var(--color-dark-brown)] hover:bg-pale-yellow/20'
                                    }`}
                            >
                                {cat}
                            </motion.button>
                        ))}
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader className="w-10 h-10 text-darkBrown animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-500">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 underline text-darkBrown"
                            >
                                Retry
                            </button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            No products found in this category.
                        </div>
                    ) : (
                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12"
                        >
                            <AnimatePresence>
                                {products.map((product) => (
                                    <motion.div
                                        layout
                                        key={product._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}

                </div>

            </main>

            <FooterSection />
        </>
    );
}
