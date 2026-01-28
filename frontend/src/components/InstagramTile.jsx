import React from 'react';
import { COLORS } from './constants';

export default function InstagramTile({ item, index }) {
  const imageUrl = `https://placehold.co/200x200/c7b6a6/5e5e5e?text=Insta+Pic+${index + 1}`;

  if (item.type === 'text') {
    return (
      <div 
        className="aspect-square flex items-center justify-center p-6 
                   text-center rounded-xl shadow-lg"
        style={{ backgroundColor: COLORS.khaki, color: COLORS.cream }}
      >
        <h3 className="font-serif text-xl md:text-2xl leading-snug">
          {item.text}
        </h3>
      </div>
    );
  }

  return (
    <div className="aspect-square overflow-hidden rounded-xl shadow-lg group cursor-pointer">
      <img 
        src={imageUrl} 
        alt={`Instagram post ${index + 1}`} 
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}
