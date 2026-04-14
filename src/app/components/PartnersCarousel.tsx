import React, { useMemo } from 'react';
import Slider from 'react-slick';
import { useContent } from '@/app/context/ContentContext';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const PartnersCarousel: React.FC = React.memo(() => {
  const { content } = useContent();

  const settings = useMemo(() => ({
    dots: false,
    infinite: content.partners.length > 4, // Only loop if we have enough items
    speed: 3000,
    slidesToShow: Math.min(content.partners.length, 4),
    slidesToScroll: 1,
    autoplay: content.partners.length > 1,
    autoplaySpeed: 0,
    cssEase: 'linear',
    pauseOnHover: true,
    arrows: false,
    swipe: true,
    touchMove: true,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: Math.min(content.partners.length, 4),
          speed: 3500,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(content.partners.length, 3),
          speed: 3000,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(content.partners.length, 2),
          speed: 2500,
          autoplaySpeed: 2000,
          centerMode: false,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: Math.min(content.partners.length, 2),
          speed: 2000,
          autoplaySpeed: 2500,
          centerMode: false,
        }
      }
    ]
  }), [content.partners.length]);

  return (
    <section className="py-12 sm:py-16 md:pt-16 md:pb-20 relative overflow-hidden">
      {/* Subtle background pattern - simplified for mobile performance */}
      <div className="absolute inset-0 opacity-10 hidden sm:block" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(24, 135, 252, 0.1) 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gradient"
          >
            Our Partners
          </motion.h2>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-transparent via-[#1887FC] to-transparent mx-auto mb-3 sm:mb-4 md:mb-5 rounded-full" />
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-medium px-4">
            Collaborating with leading organizations to maximize research impact
          </p>
        </motion.div>

        <div className="partners-carousel mt-6 sm:mt-8">
          <Slider {...settings}>
            {content.partners.map((partner, index) => (
              <div key={partner.id} className="px-2 sm:px-3 md:px-4 outline-none">
                <PartnerCard partner={partner} index={index} />
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <style>{`
        .partners-carousel .slick-slide {
          padding: 0 4px;
        }

        .partners-carousel .slick-list {
          margin: 0 -4px;
          overflow: visible;
        }

        .partners-carousel .slick-track {
          display: flex;
          align-items: stretch;
        }

        .partners-carousel .slick-slide > div {
          height: 100%;
        }

        @media (min-width: 640px) {
          .partners-carousel .slick-slide {
            padding: 0 8px;
          }
          .partners-carousel .slick-list {
            margin: 0 -8px;
          }
        }

        /* Touch optimization */
        .partners-carousel .slick-slider {
          touch-action: pan-y pinch-zoom;
        }

        .partners-carousel .slick-slide {
          touch-action: pan-y;
        }
      `}</style>
    </section>
  );
});

// Separate component for partner card to optimize re-renders
interface PartnerCardProps {
  partner: { id: string; name: string; logoUrl: string };
  index: number;
}

const PartnerCard: React.FC<PartnerCardProps> = React.memo(({ partner, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      viewport={{ once: true, margin: "-30px" }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-[160px] sm:min-h-[180px] h-full shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer select-none mx-auto w-full max-w-[280px]"
    >
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-[#1887FC]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />

      <div className="flex-1 w-full flex items-center justify-center mb-4 relative shrink-0">
        {/* Subtle glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1887FC]/5 to-[#3b82f6]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="w-full h-16 sm:h-20 md:h-24 p-2 flex items-center justify-center">
          <ImageWithFallback
            src={partner.logoUrl}
            alt={partner.name}
            className="max-w-full max-h-full object-contain transition-all duration-500 group-hover:scale-105 relative z-10"
            title={partner.name}
          />
        </div>
      </div>
      
      <div className="w-full pt-2 border-t border-gray-50 group-hover:border-blue-50 transition-colors duration-300">
        <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 text-center font-semibold group-hover:text-[#1887FC] transition-colors duration-200 line-clamp-2 leading-tight px-1">
          {partner.name}
        </p>
      </div>
    </motion.div>
  );
});