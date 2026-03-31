import React, { useMemo } from 'react';
import Slider from 'react-slick';
import { useContent } from '@/app/context/ContentContext';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const PartnersCarousel: React.FC = React.memo(() => {
  const { content } = useContent();

  const settings = useMemo(() => ({
    dots: false,
    infinite: true,
    speed: 4000,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: 'linear',
    pauseOnHover: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  }), []);

  return (
    <section className="pt-16 pb-20 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.98) 30%, rgba(255,255,255,1) 100%)'
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(24, 135, 252, 0.08) 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }} />
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/8 to-[#1887FC]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-[#1887FC]/8 to-blue-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block relative"
          >
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1887FC]/5 via-blue-50/50 to-[#3b82f6]/5 blur-2xl rounded-full transform scale-150" />
            
            <h2 className="relative text-4xl sm:text-5xl font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg, #1887FC 0%, #3b82f6 50%, #60a5fa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
              }}
            >
              Our Partners
            </h2>
          </motion.div>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#1887FC] to-transparent mx-auto mb-5 rounded-full shadow-lg" />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Collaborating with leading organizations to maximize research impact
          </p>
        </motion.div>

        <div className="partners-carousel mt-8">
          <Slider {...settings}>
            {content.partners.map((partner, index) => (
              <div key={partner.id} className="px-4">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  className="card-futuristic p-8 flex flex-col items-center justify-center h-48 group cursor-pointer"
                >
                  {/* Accent Line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1887FC] via-[#3b82f6] to-[#60a5fa] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="h-24 w-full flex items-center justify-center mb-4 relative overflow-hidden">
                    {/* Glow Effect Behind Logo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1887FC]/20 to-[#3b82f6]/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <ImageWithFallback
                      src={partner.logoUrl}
                      alt={partner.name}
                      className="max-w-full max-h-20 object-contain transition-all duration-500 transform group-hover:scale-110 relative z-10 drop-shadow-lg"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                  </div>
                  <p className="text-sm text-gray-700 text-center font-semibold group-hover:text-[#1887FC] transition-colors duration-300">
                    {partner.name}
                  </p>
                </motion.div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <style>{`
        .partners-carousel .slick-slide {
          padding: 0 8px;
        }
        
        .partners-carousel .slick-list {
          margin: 0 -8px;
        }
        
        .partners-carousel .slick-track {
          display: flex;
          align-items: center;
        }
      `}</style>
    </section>
  );
});