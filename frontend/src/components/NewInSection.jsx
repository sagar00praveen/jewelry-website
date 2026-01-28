import React, { useEffect, useState } from 'react';
import { FALLBACK_PRODUCTS } from '../data/products';
import ProductCard from './ProductCard';
import { Loader } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';

export default function NewInSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch 4 newest products
        const response = await api.get('/products?limit=4&sort=-createdAt');
        setProducts(response.data.data.products);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        // Fallback to local data (first 4)
        setProducts(FALLBACK_PRODUCTS.slice(0, 4));
        // Remove error setting to show fallback instead of error message
        // setError("Unable to load new arrivals.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="py-24 bg-cream flex justify-center items-center">
        <Loader className="w-8 h-8 text-darkBrown animate-spin" />
      </div>
    );
  }

  if (error || products.length === 0) {
    // Optionally hide section or show message. For now, we prefer not to show empty sections if possible, 
    // but to satisfy "working frontend", a message is better than nothing.
    return (
      <section className="py-16 md:py-24 bg-cream text-darkBrown">
        <div className="text-center">
          <h2 className="text-3xl font-serif tracking-widest mb-4">New In</h2>
          <p className="text-sm">{error || "No new arrivals yet."}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-cream text-darkBrown">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-serif tracking-widest">New In</h2>
        <div className="w-16 h-0.5 bg-darkBrown mx-auto mt-4 opacity-20"></div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative group/slider">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a href="/shop" className="inline-block border-b border-darkBrown pb-1 text-sm tracking-widest hover:text-khaki hover:border-khaki transition-colors">
            VIEW ALL COLLECTIONS
          </a>
        </motion.div>
      </div>
    </section>
  );
}
