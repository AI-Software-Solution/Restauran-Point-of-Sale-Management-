import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaStar, FaChevronLeft, FaChevronRight, FaQuoteLeft } from 'react-icons/fa';

const TestimonialsSection = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = data || [
    {
      _id: '1',
      customerName: 'Aziz Karimov',
      rating: 5,
      content: 'Ajoyib restoran! Osh juda mazali, xizmat a\'lo darajada.',
    },
    {
      _id: '2',
      customerName: 'Dilnoza Rahimova',
      rating: 5,
      content: 'Oilamiz bilan har hafta kelamiz. Atmosfera juda yaxshi.',
    },
    {
      _id: '3',
      customerName: 'Sardor Aliyev',
      rating: 4,
      content: 'Taomlar sifati yuqori, narxlar ham o\'rtacha.',
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`text-lg ${i < rating ? 'text-imperial-gold' : 'text-imperial-cream/20'}`}
      />
    ));
  };

  return (
    <section id="testimonials" className="py-20 bg-imperial-navy relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border-2 border-imperial-gold" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full border-2 border-imperial-gold" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-imperial-gold font-body text-lg tracking-widest uppercase">
            Mijozlarimiz Fikri
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-imperial-cream font-bold mt-2">
            Sharhlar
          </h2>
          <div className="w-24 h-1 bg-imperial-gold mx-auto mt-4" />
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-12 h-12 rounded-full bg-imperial-gold/10 border border-imperial-gold/30 flex items-center justify-center text-imperial-gold hover:bg-imperial-gold/20 transition-colors"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-12 h-12 rounded-full bg-imperial-gold/10 border border-imperial-gold/30 flex items-center justify-center text-imperial-gold hover:bg-imperial-gold/20 transition-colors"
          >
            <FaChevronRight />
          </button>

          {/* Testimonial Card */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-imperial-navy-light rounded-2xl p-8 md:p-12 border border-imperial-gold/20 text-center"
          >
            <FaQuoteLeft className="text-4xl text-imperial-gold/30 mx-auto mb-6" />

            <p className="font-body text-xl md:text-2xl text-imperial-cream/90 italic mb-8 leading-relaxed">
              "{testimonials[currentIndex].content}"
            </p>

            <div className="flex justify-center gap-1 mb-4">
              {renderStars(testimonials[currentIndex].rating)}
            </div>

            <div className="flex items-center justify-center gap-4">
              {testimonials[currentIndex].customerImage ? (
                <img
                  src={testimonials[currentIndex].customerImage}
                  alt={testimonials[currentIndex].customerName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-imperial-gold"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-imperial-gold/20 flex items-center justify-center text-imperial-gold font-display text-2xl">
                  {testimonials[currentIndex].customerName.charAt(0)}
                </div>
              )}
              <div className="text-left">
                <h4 className="font-display text-lg text-imperial-cream">
                  {testimonials[currentIndex].customerName}
                </h4>
                <p className="text-imperial-cream/50 font-body">Doimiy mijoz</p>
              </div>
            </div>
          </motion.div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-imperial-gold w-8'
                    : 'bg-imperial-gold/30 hover:bg-imperial-gold/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
