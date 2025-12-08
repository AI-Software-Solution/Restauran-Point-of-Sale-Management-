import { motion } from 'framer-motion';
import { useState } from 'react';

const MenuSection = ({ data }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const categories = data?.categories || [];
  const featured = data?.featured || [];

  const displayProducts = activeCategory === 'all'
    ? featured
    : categories.find(c => c._id === activeCategory)?.products || [];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  return (
    <section id="menu" className="py-20 bg-imperial-navy relative overflow-hidden">
      {/* Decorative corner */}
      <div className="absolute top-0 left-0 w-64 h-64 border-l-2 border-t-2 border-imperial-gold/20 rounded-br-full" />
      <div className="absolute bottom-0 right-0 w-64 h-64 border-r-2 border-b-2 border-imperial-gold/20 rounded-tl-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-imperial-gold font-body text-lg tracking-widest uppercase">
            Bizning Taomlar
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-imperial-cream font-bold mt-2">
            Menyu
          </h2>
          <div className="w-24 h-1 bg-imperial-gold mx-auto mt-4" />
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-6 py-2 rounded-full font-body text-lg transition-all ${
              activeCategory === 'all'
                ? 'bg-imperial-gold text-imperial-navy'
                : 'border border-imperial-gold/50 text-imperial-cream hover:border-imperial-gold'
            }`}
          >
            Hammasi
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => setActiveCategory(category._id)}
              className={`px-6 py-2 rounded-full font-body text-lg transition-all ${
                activeCategory === category._id
                  ? 'bg-imperial-gold text-imperial-navy'
                  : 'border border-imperial-gold/50 text-imperial-cream hover:border-imperial-gold'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Menu Items */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-imperial-navy-light rounded-xl p-6 border border-imperial-gold/20 hover:border-imperial-gold/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-display text-xl text-imperial-cream group-hover:text-imperial-gold transition-colors">
                    {product.name}
                  </h3>
                  {product.category && (
                    <span className="text-imperial-cream/50 font-body text-sm">
                      {product.category.name}
                    </span>
                  )}
                </div>
                <span className="font-display text-lg text-imperial-gold font-semibold whitespace-nowrap ml-4">
                  {formatPrice(product.price)}
                </span>
              </div>
              <div className="h-px bg-imperial-gold/20 w-full" />
            </motion.div>
          ))}
        </div>

        {displayProducts.length === 0 && (
          <div className="text-center text-imperial-cream/50 py-12 font-body text-lg">
            Bu kategoriyada taomlar mavjud emas
          </div>
        )}
      </div>
    </section>
  );
};

export default MenuSection;
