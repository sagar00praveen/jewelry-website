import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from './constants';

export default function ProductCard({ product }) {
  // Use product.image (filename) if available
  const imageFilename = product.image;

  // Construct URL: if external link use as is, otherwise use local asset path
  const imageUrl = product.imageCover || (imageFilename && (imageFilename.startsWith('http') || imageFilename.startsWith('/'))
    ? imageFilename
    : imageFilename
      ? `/assets/${imageFilename}`
      : `https://placehold.co/600x600/${COLORS.cream.slice(1)}/${COLORS.darkBrown.slice(1)}?text=${encodeURIComponent(product.name)}`);

  // Formatter for price
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <Link to={`/shop/${product._id}`} className="group flex flex-col items-center cursor-pointer block">
      <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-gray-100 mb-4 group-hover:shadow-lg transition-shadow duration-300">

        {/* Tag / Badge */}
        {product.inStock === false && (
          <span className="absolute top-3 left-3 text-xs bg-red-500 text-white px-2 py-1 rounded-full font-medium z-10 tracking-wide uppercase">
            Sold Out
          </span>
        )}

        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center pb-6 bg-gradient-to-t from-black/20 to-transparent">
          <button className="bg-white text-darkBrown px-6 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-cream transition-colors">
            View Details
          </button>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h3 className="text-darkBrown text-lg font-medium tracking-wide font-serif">
          {product.name}
        </h3>
        <p className="text-gray-500 text-sm font-sans tracking-wider">{formattedPrice}</p>
      </div>
    </Link>
  );
}
