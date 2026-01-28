import React from 'react';
import SerifText from './SerifText';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section
      className="relative h-[90vh] flex items-center justify-center pt-20"
      style={{
        backgroundColor: '#d6c4b2',
        backgroundImage: 'url("/assets/banner image.jpg")', // Using the local banner asset
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >

      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative text-center text-cream p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <SerifText className="text-cream drop-shadow-lg text-6xl md:text-8xl">ISHAANI</SerifText>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="font-sans text-xl md:text-3xl mt-6 tracking-wider drop-shadow-md"
        >
          Timeless Pieces for a Sustainable Life
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          <a href="/shop" className="mt-10 px-10 py-4 bg-cream text-black text-sm 
                              tracking-widest font-medium rounded-md shadow-lg 
                              hover:bg-khaki hover:text-cream transition duration-300 inline-block uppercase">
            Shop Now
          </a>
        </motion.div>
      </div>

    </section>
  );
}
