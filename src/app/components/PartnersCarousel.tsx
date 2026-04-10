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
    speed: 3000,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
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
          slidesToShow: 4,
          speed: 3500,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          speed: 3000,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          speed: 2500,
          autoplaySpeed: 2000,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          speed: 2000,
          autoplaySpeed: 2500,
          centerMode: true,
          centerPadding: '40px',
        }
      }
    ]
  }), []);

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
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center h-32 sm:h-36 md:h-44 lg:h-48 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer select-none"
    >
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-4 right-4 sm:left-6 sm:right-6 h-0.5 bg-gradient-to-r from-transparent via-[#1887FC]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />

      <div className="h-12 sm:h-14 md:h-16 lg:h-20 w-full flex items-center justify-center mb-2 sm:mb-3 relative">
        {/* Subtle glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1887FC]/5 to-[#3b82f6]/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <ImageWithFallback
          src={partner.logoUrl}
          alt={partner.name}
          className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105 relative z-10"
          style={{ width: 'auto', height: 'auto', maxHeight: '100%' }}
        />
      </div>
      <p className="text-xs sm:text-sm text-gray-700 text-center font-medium group-hover:text-[#1887FC] transition-colors duration-200 line-clamp-2 px-1">
        {partner.name}
      </p>
    </motion.div>
  );
});