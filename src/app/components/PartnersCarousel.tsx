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
          centerMode: true,
          centerPadding: '40px',
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

        <div className="mt-6 sm:mt-8">
          {/* Mobile: Seamless Infinite Loop | Desktop: Slick Slider */}
          <div className="block sm:hidden overflow-hidden relative">
            <div className="flex animate-infinite-scroll w-fit">
              {/* Double the items for seamless looping */}
              {[...content.partners, ...content.partners].map((partner, index) => (
                <div key={`${partner.id}-${index}`} className="px-3 min-w-[240px]">
                  <PartnerCard partner={partner} index={index} />
                </div>
              ))}
            </div>
            
            {/* Gradient masks for smooth fade edges */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#f8fbff] to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#f8fbff] to-transparent z-10" />
          </div>

          <div className="hidden sm:block partners-carousel">
            <Slider {...settings}>
              {content.partners.map((partner, index) => (
                <div key={partner.id} className="px-2 sm:px-3 md:px-4 outline-none">
                  <PartnerCard partner={partner} index={index} />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 25s linear infinite;
        }
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
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
      className="bg-white rounded-[2rem] p-4 sm:p-6 flex flex-col items-center justify-center h-[200px] sm:h-[220px] md:h-[240px] w-full shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer select-none mx-auto max-w-[280px]"
    >
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="w-full h-[60%] flex items-center justify-center relative mb-4">
          <ImageWithFallback
            src={partner.logoUrl}
            alt={partner.name}
            className="max-w-[85%] max-h-full object-contain transition-all duration-500 group-hover:scale-105 relative z-10"
            title={partner.name}
          />
        </div>
        
        <div className="w-full h-[30%] flex items-center justify-center text-center">
          <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 font-medium line-clamp-2 leading-tight px-2">
            {partner.name}
          </p>
        </div>
      </div>
    </motion.div>
  );
});