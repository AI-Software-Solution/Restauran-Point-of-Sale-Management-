import { motion } from 'framer-motion';
import { FaArrowDown } from 'react-icons/fa';

const HeroSection = ({ data }) => {
  const scrollToMenu = () => {
    const element = document.querySelector('#menu');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-imperial-gradient" />
        {data?.backgroundImage && (
          <img
            src={data.backgroundImage}
            alt="Hero background"
            className="w-full h-full object-cover opacity-30"
          />
        )}
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-imperial-navy" />
      </div>

      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Crown decoration */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-imperial-gold text-5xl mb-6"
          >
            👑
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-imperial-cream font-bold mb-6">
            {data?.title || 'Bobur Mirzo'}
            <span className="block text-imperial-gold">Restaurant</span>
          </h1>

          <p className="font-body text-xl md:text-2xl text-imperial-cream/80 mb-4 italic">
            {data?.subtitle || 'Imperatorlik Taomlarining Zamonaviy Talqini'}
          </p>

          <p className="font-body text-lg text-imperial-cream/60 mb-12 max-w-2xl mx-auto">
            {data?.description || "O'zbekistonning boy oshxona an'analarini kashf eting"}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToMenu}
              className="bg-imperial-gold text-imperial-navy px-8 py-4 rounded-lg font-display text-lg font-semibold hover:bg-imperial-gold-light transition-all shadow-lg shadow-imperial-gold/30"
            >
              Menyuni Ko'rish
            </motion.button>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-imperial-gold text-imperial-gold px-8 py-4 rounded-lg font-display text-lg font-semibold hover:bg-imperial-gold/10 transition-all"
            >
              Bron Qilish
            </motion.a>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <button onClick={scrollToMenu} className="text-imperial-gold/60 hover:text-imperial-gold transition-colors">
            <FaArrowDown className="text-2xl" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
