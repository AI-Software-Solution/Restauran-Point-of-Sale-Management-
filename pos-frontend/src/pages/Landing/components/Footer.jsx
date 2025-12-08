import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaHeart, FaTelegram, FaInstagram, FaFacebook } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Bosh sahifa', href: '#hero' },
    { name: 'Menyu', href: '#menu' },
    { name: 'Xususiyatlar', href: '#features' },
    { name: 'Sharhlar', href: '#testimonials' },
    { name: 'Aloqa', href: '#contact' },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-imperial-navy border-t border-imperial-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <motion.div whileHover={{ scale: 1.02 }} className="inline-block">
              <span className="font-display text-3xl text-imperial-gold font-bold">
                Bobur Mirzo
              </span>
            </motion.div>
            <p className="font-body text-imperial-cream/60 mt-4 leading-relaxed">
              Imperatorlik an'analaridan ilhomlangan zamonaviy O'zbek oshxonasi.
              Har bir taomda tarix, madaniyat va sevgi.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg text-imperial-cream mb-6">
              Tezkor Havolalar
            </h4>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="font-body text-imperial-cream/60 hover:text-imperial-gold transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
              <li>
                <Link
                  to="/auth"
                  className="font-body text-imperial-gold hover:text-imperial-gold-light transition-colors"
                >
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-display text-lg text-imperial-cream mb-6">
              Bog'lanish
            </h4>
            <p className="font-body text-imperial-cream/60 mb-2">
              +998 90 123 45 67
            </p>
            <p className="font-body text-imperial-cream/60 mb-6">
              info@boburmirzo.uz
            </p>

            <div className="flex gap-3">
              {[
                { icon: FaTelegram, href: '#' },
                { icon: FaInstagram, href: '#' },
                { icon: FaFacebook, href: '#' },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-full bg-imperial-gold/10 border border-imperial-gold/30 flex items-center justify-center text-imperial-gold hover:bg-imperial-gold/20 transition-colors"
                >
                  <social.icon className="text-lg" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Line */}
        <div className="h-px bg-gradient-to-r from-transparent via-imperial-gold/50 to-transparent" />

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-imperial-cream/40 text-sm text-center md:text-left">
            © {currentYear} Bobur Mirzo Restaurant. Barcha huquqlar himoyalangan.
          </p>
          <p className="font-body text-imperial-cream/40 text-sm flex items-center gap-1">
            Yaratildi <FaHeart className="text-imperial-burgundy" /> bilan
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
