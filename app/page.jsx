import Hero from '@/components/home/Hero';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import OfferBanners from '@/components/home/OfferBanners';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <OfferBanners />
      <FeaturedProducts />
    </>
  );
}
