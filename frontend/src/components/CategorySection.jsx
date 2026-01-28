import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Loader } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { FALLBACK_PRODUCTS } from '../data/products';

export default function CategorySection({ category, title, bgColor = 'bg-cream' }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Fetch 3 products for this category
                const response = await api.get(`/products?category=${category}&limit=3`);
                setProducts(response.data.data.products);
            } catch (err) {
                console.error(`Failed to fetch ${category} products:`, err);
                // Fallback
                const fallback = FALLBACK_PRODUCTS.filter(p => p.category === category).slice(0, 3);
                setProducts(fallback);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category]);

    if (loading) {
        // Optional: show loader or just render nothing until loaded to avoid jumpy layout
        return (
            <div className={`${bgColor} py-12 flex justify-center items-center`}>
                <Loader className="w-6 h-6 text-darkBrown animate-spin" />
            </div>
        );
    }

    if (products.length === 0) {
        return null; // Don't show empty categories
    }

    return (
        <section className={`py-16 md:py-24 ${bgColor} text-darkBrown`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
            >
                <h2 className="text-3xl font-serif tracking-widest uppercase">{title || category}</h2>
                <div className="w-16 h-0.5 bg-darkBrown mx-auto mt-4 opacity-20"></div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                >
                    {products.map((product, index) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </motion.div>



            </div>
        </section>
    );
}
