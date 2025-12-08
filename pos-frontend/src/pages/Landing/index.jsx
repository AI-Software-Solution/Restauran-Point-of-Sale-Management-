import { useEffect, useState } from 'react';
import { axiosWrapper } from '../../https/axiosWrapper';
import {
  Navbar,
  HeroSection,
  MenuSection,
  FeaturesSection,
  TestimonialsSection,
  ContactSection,
  Footer
} from './components';

const Landing = () => {
  const [landingData, setLandingData] = useState({
    hero: {},
    features: [],
    contact: {},
    testimonials: [],
    menu: { featured: [], categories: [] }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const response = await axiosWrapper.get('/api/landing');
        if (response.data.success) {
          setLandingData(response.data.data);
        }
      } catch {
        // Use default data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-imperial-navy flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-imperial-gold/30 border-t-imperial-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="font-body text-imperial-cream/60">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-imperial-navy">
      <Navbar />
      <HeroSection data={landingData.hero} />
      <MenuSection data={landingData.menu} />
      <FeaturesSection data={landingData.features} />
      <TestimonialsSection data={landingData.testimonials} />
      <ContactSection data={landingData.contact} />
      <Footer />
    </div>
  );
};

export default Landing;
