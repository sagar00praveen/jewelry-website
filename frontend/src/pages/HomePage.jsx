import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import NewInSection from '../components/NewInSection';
import CategorySection from '../components/CategorySection';
import FollowUsSection from '../components/FollowUsSection';
import FooterSection from '../components/FooterSection';

export default function HomePage() {
  return (
    <>
      <Header />
      <HeroSection />
      <NewInSection />

      {/* Category Sections */}
      <CategorySection category="rings" title="Rings" bgColor="bg-white" />
      <CategorySection category="necklaces" title="Necklaces" bgColor="bg-cream" />
      <CategorySection category="earrings" title="Earrings" bgColor="bg-white" />
      <CategorySection category="bracelets" title="Bracelets" bgColor="bg-cream" />
      <CategorySection category="watches" title="Watches" bgColor="bg-white" />


      <FooterSection />
    </>
  );
}
