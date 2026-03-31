import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';

export const Contact: React.FC = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'main@impactrd.org',
      link: 'mailto:main@impactrd.org',
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '(049) 547 7357',
      link: 'tel:+63495477357',
    },
    {
      icon: MapPin,
      title: 'Location',
      value: '47 Razburg Bldg., Manese St., San Agustin, Bay, Laguna',
      link: null,
    },
  ];

  return (
    <section id="contact" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
            Support Our Work
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-[#1887FC] to-[#4da3fd] mx-auto mb-4 sm:mb-6 rounded-full shadow-lg" />
          <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            With your support, we can fund more scholars, empower communities, and drive innovation across the Philippines.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto mb-10 sm:mb-12 md:mb-16">
          {contactInfo.map((info, index) => (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 h-full border-0 shadow-md bg-gradient-to-br from-white to-blue-50/30">
                <CardContent className="p-5 sm:p-6 text-center">
                  <motion.div 
                    className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#1887FC] to-[#0b5ab8] rounded-full mb-3 sm:mb-4 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <info.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </motion.div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2">{info.title}</h3>
                  {info.link ? (
                    <a
                      href={info.link}
                      className="text-xs sm:text-sm md:text-base text-gray-600 hover:text-[#1887FC] transition-colors font-medium break-words"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">{info.value}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <Card className="overflow-hidden border-0 shadow-xl rounded-xl sm:rounded-2xl">
            <CardContent className="p-0">
              <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[450px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3871.6166666666665!2d121.27!3d14.19!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDExJzI0LjAiTiAxMjHCsDE2JzEyLjAiRQ!5e0!3m2!1sen!2sph!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="IMPACT R&D Location - Bay, Laguna"
                  className="w-full h-full"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};