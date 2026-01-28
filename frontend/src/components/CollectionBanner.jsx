import React from 'react';
import { COLORS } from './constants';

export default function CollectionBanner() {
  return (
    <section className="py-16 md:py-32" style={{ backgroundColor: COLORS.khaki }}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 
                      flex flex-col lg:flex-row items-center 
                      justify-between text-cream">

        <div className="lg:w-1/2 mb-12 lg:mb-0 lg:pr-12">
          <h2 className="font-serif text-5xl md:text-6xl mb-6">
            The Heritage Collection
          </h2>

          <p className="font-sans text-lg mb-8 max-w-md">
            Our signature collection: where vintage craftsmanship meets modern elegance.
          </p>

          <a href="/shop" className="px-8 py-3 bg-darkBrown text-cream text-sm 
                              tracking-widest font-medium rounded-md 
                              hover:bg-darkBrown/80 transition duration-300 inline-block">
            SHOP THE COLLECTION
          </a>
        </div>

        <div className="relative w-full lg:w-1/2 flex justify-center lg:justify-end">
          <div
            className="w-full max-w-sm h-96 rounded-xl shadow-2xl overflow-hidden"
            style={{
              backgroundImage: 'url("https://placehold.co/600x600/b8a090/fff?text=Featured+Ring+Set")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: 'translateX(10%)',
              boxShadow: '8px 8px 30px rgba(0, 0, 0, 0.2)'
            }}
          />
        </div>

      </div>
    </section>
  );
}
