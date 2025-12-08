import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaInstagram, FaTelegram, FaFacebook } from 'react-icons/fa';

const ContactSection = ({ data }) => {
  const contactInfo = {
    address: data?.address || 'Xorazm viloyati, Urganch shahri',
    phone: data?.phone || '+998 90 123 45 67',
    email: data?.email || 'info@boburmirzo.uz',
    workingHours: data?.workingHours || 'Har kuni: 10:00 - 23:00',
    latitude: data?.latitude || '41.5500',
    longitude: data?.longitude || '60.6333',
  };

  const contactItems = [
    { icon: FaMapMarkerAlt, label: 'Manzil', value: contactInfo.address },
    { icon: FaPhone, label: 'Telefon', value: contactInfo.phone, href: `tel:${contactInfo.phone.replace(/\s/g, '')}` },
    { icon: FaEnvelope, label: 'Email', value: contactInfo.email, href: `mailto:${contactInfo.email}` },
    { icon: FaClock, label: 'Ish vaqti', value: contactInfo.workingHours },
  ];

  return (
    <section id="contact" className="py-20 bg-imperial-navy-light relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-imperial-gold font-body text-lg tracking-widest uppercase">
            Biz Bilan Bog'laning
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-imperial-cream font-bold mt-2">
            Aloqa
          </h2>
          <div className="w-24 h-1 bg-imperial-gold mx-auto mt-4" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h3 className="font-display text-2xl text-imperial-cream mb-6">
              Bizga Tashrif Buyuring
            </h3>

            <div className="space-y-6">
              {contactItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-imperial-gold/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="text-imperial-gold text-xl" />
                  </div>
                  <div>
                    <span className="text-imperial-cream/50 font-body text-sm">{item.label}</span>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="block font-body text-lg text-imperial-cream hover:text-imperial-gold transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="font-body text-lg text-imperial-cream">{item.value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <div className="pt-8 border-t border-imperial-gold/20">
              <h4 className="font-display text-lg text-imperial-cream mb-4">
                Ijtimoiy Tarmoqlarda
              </h4>
              <div className="flex gap-4">
                {[
                  { icon: FaTelegram, href: '#', label: 'Telegram' },
                  { icon: FaInstagram, href: '#', label: 'Instagram' },
                  { icon: FaFacebook, href: '#', label: 'Facebook' },
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-12 h-12 rounded-full bg-imperial-gold/10 border border-imperial-gold/30 flex items-center justify-center text-imperial-gold hover:bg-imperial-gold/20 transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="text-xl" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-imperial-navy rounded-2xl overflow-hidden border border-imperial-gold/20 h-96 lg:h-full min-h-[400px]">
              {/* Google Maps Embed - Bobur Mirzo Somsalari */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1558.5!2d60.6017586!3d41.562272!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x41dfc9006ba9bfb1%3A0x16316f2bfb1da3aa!2sBobur%20Mirzo%20Somsalari!5e0!3m2!1suz!2s!4v1701500000000!5m2!1suz!2s"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bobur Mirzo Somsalari - Urganch, Xorazm"
                className="rounded-2xl"
              />
              {/* Fallback link */}
              <div className="absolute bottom-4 right-4">
                <a
                  href="https://maps.app.goo.gl/mCMpxQ8vEQxuv5yv7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-imperial-gold/90 hover:bg-imperial-gold text-imperial-navy px-4 py-2 rounded-lg font-body text-sm flex items-center gap-2 transition-colors"
                >
                  <FaMapMarkerAlt />
                  Katta xaritada ochish
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
