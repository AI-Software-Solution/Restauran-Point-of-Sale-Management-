import { motion } from 'framer-motion';
import { FaLeaf, FaTruck, FaBook, FaUsers, FaHeart, FaClock, FaAward, FaUtensils } from 'react-icons/fa';

const iconMap = {
  halal: FaLeaf,
  delivery: FaTruck,
  recipe: FaBook,
  family: FaUsers,
  love: FaHeart,
  time: FaClock,
  award: FaAward,
  food: FaUtensils,
};

const FeaturesSection = ({ data }) => {
  const features = data || [
    { key: 'feature1', title: 'Halol Mahsulotlar', icon: 'halal' },
    { key: 'feature2', title: 'Tez Yetkazib Berish', icon: 'delivery' },
    { key: 'feature3', title: "An'anaviy Retseptlar", icon: 'recipe' },
    { key: 'feature4', title: 'Oilaviy Muhit', icon: 'family' },
  ];

  return (
    <section id="features" className="py-20 bg-imperial-navy-light relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-imperial-gold font-body text-lg tracking-widest uppercase">
            Nega Bizni Tanlash Kerak
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-imperial-cream font-bold mt-2">
            Bizning Xususiyatlar
          </h2>
          <div className="w-24 h-1 bg-imperial-gold mx-auto mt-4" />
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || FaUtensils;
            return (
              <motion.div
                key={feature.key || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="text-center group"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-imperial-gold/10 flex items-center justify-center group-hover:bg-imperial-gold/20 transition-colors">
                  <IconComponent className="text-3xl text-imperial-gold" />
                </div>
                <h3 className="font-display text-xl text-imperial-cream mb-3">
                  {feature.title}
                </h3>
                <div className="w-12 h-0.5 bg-imperial-gold/50 mx-auto" />
              </motion.div>
            );
          })}
        </div>

        {/* Decorative quote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <blockquote className="font-body text-2xl md:text-3xl text-imperial-cream/70 italic max-w-3xl mx-auto">
            "Taom faqat ovqat emas, u san'at, u muhabbat, u madaniyatdir"
          </blockquote>
          <p className="text-imperial-gold font-display mt-4">— Bobur Mirzo</p>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
