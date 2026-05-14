import React, { Suspense } from 'react';
import { motion } from 'motion/react';
import { useContent } from "@/app/context/ContentContext";
import { SectionTheme } from "@/app/components/SectionTheme";
import { PageHeaderTheme } from "@/app/components/PageHeaderTheme";
import { PageSkeletonLoader } from "@/app/components/PageSkeletonLoader";


// Lazy load sections for better performance
const NewsCarousel = React.lazy(() => import("@/app/components/NewsCarousel").then(m => ({ default: m.NewsCarousel })));
const FeaturedHighlightsSection = React.lazy(() => import("@/app/components/FeaturedHighlightsSection").then(m => ({ default: m.FeaturedHighlightsSection })));
const PartnersCarousel = React.lazy(() => import("@/app/components/PartnersCarousel").then(m => ({ default: m.PartnersCarousel })));
const ResearchBayanihanSection = React.lazy(() => import("@/app/components/ResearchBayanihanSection").then(m => ({ default: m.ResearchBayanihanSection })));

// Loading skeleton for sections
const SectionSkeleton: React.FC = () => (
  <div className="w-full h-96 flex items-center justify-center">
    <div className="animate-pulse text-gray-400">Loading...</div>
  </div>
);

export const HomePage: React.FC = () => {
  const { loadingStates, fetchNews, fetchHighlights, fetchPublications, fetchPartners, fetchHeroSection } = useContent();
  const [pageLoading, setPageLoading] = React.useState(true);

  // Fetch data when component mounts
  React.useEffect(() => {
    const loadPageData = async () => {
      // Don't block the initial render with a full page loading state if possible
      // Let lazy components handle their own loading via Suspense
      try {
        // Fetch hero section first as it's the primary visual element
        await fetchHeroSection();
        setPageLoading(false);

        // Fetch remaining data in the background
        Promise.all([
          fetchNews(),
          fetchHighlights(),
          fetchPublications(),
          fetchPartners(),
        ]).catch(err => console.error('[HomePage] Background fetch error:', err));
        
      } catch (error) {
        console.error('[HomePage] Error fetching critical page data:', error);
        setPageLoading(false);
      }
    };

    loadPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only show full page loader if hero isn't loaded yet
  const isLoading = pageLoading && loadingStates.hero;
  
  if (isLoading) {
    return <PageSkeletonLoader message="Loading Home..." />;
  }

  return (
    <>
      <PageHeaderTheme
        theme="transparent"
        scrollThreshold={700}
      />

      <SectionTheme
        theme="transparent"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        id="home"
      >
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <video
              className="absolute inset-0 w-full h-full"
              style={{
                pointerEvents: "none",
                objectFit: "cover",
              }}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src={new URL('../../assets/home_bg.mp4', import.meta.url).toString()} type="video/mp4" />
            </video>
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-[#1887FC]/30 via-blue-400/20 to-[#60a5fa]/25" />

          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 30% 50%, rgba(24,135,252,0.3) 0%, transparent 50%),
                radial-gradient(circle at 70% 50%, rgba(59,130,246,0.2) 0%, transparent 50%)
              `,
              animation:
                "gradientShift 10s ease-in-out infinite alternate",
            }}
          />

          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: 0,
              }}
              animate={{
                y: [0, -800],
                x: [0, (Math.random() - 0.5) * 200],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* CONTENT */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            {/* LOGO + TAGLINE OVERLAP */}
            <div className="flex flex-col items-center">
              <motion.img
                src="/images/logos/impact.png"
                alt="IMPACT R&D Logo"
                className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl h-auto mb-8 translate-y-12 -mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                loading="eager"
                style={{
                  filter:
                    "drop-shadow(0 20px 40px rgba(0,0,0,0.15)) drop-shadow(0 0 8px rgba(255,255,255,0.8))",
                  zIndex: 1,
                }}
              />

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="
                  text-2xl sm:text-3xl md:text-4xl
                  text-white font-extrabold
                  text-center
                  max-w-4xl px-4
                  mb-10
                "
                style={{
                  textShadow:
                    "0 4px 20px rgba(0,0,0,0.6), 0 0 40px rgba(24,135,252,0.4)",
                  letterSpacing: "-0.01em",
                  lineHeight: "1.2",
                  zIndex: 2,
                }}
              >
                “A DOST-certified Science & Technology Foundation”
              </motion.p>
            </div>

            {/* Since 2023 Badge - Now below content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className="relative inline-flex items-center justify-center">
                {/* Animated glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#1887FC] via-[#3b82f6] to-[#60a5fa] blur-2xl opacity-40 rounded-full"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.4, 0.6, 0.4],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Badge container */}
                <div className="relative bg-gradient-to-r from-white/90 via-white/95 to-white/90 backdrop-blur-lg px-8 py-3 rounded-full border-2 border-[#1887FC]/20 shadow-2xl">
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="flex items-center gap-3">
                    {/* Decorative star icon */}
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="text-[#1887FC] text-lg"
                    >
                      ✦
                    </motion.div>

                    <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#1887FC] via-[#3b82f6] to-[#1887FC] bg-clip-text text-transparent tracking-wide">
                      Established 2023
                    </span>

                    {/* Decorative star icon */}
                    <motion.div
                      animate={{
                        rotate: [360, 0],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="text-[#1887FC] text-lg"
                    >
                      ✦
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </SectionTheme>

      <SectionTheme theme="light" className="py-6 sm:py-8 md:py-10 bg-white">
        <Suspense fallback={<SectionSkeleton />}>
          <NewsCarousel />
        </Suspense>
      </SectionTheme>

      <SectionTheme theme="light" className="py-6 sm:py-8 md:py-10 bg-[#f8fbff]" id="highlights">
        <Suspense fallback={<SectionSkeleton />}>
          <FeaturedHighlightsSection />
        </Suspense>
      </SectionTheme>

      <SectionTheme theme="dark" className="py-6 sm:py-8 md:py-10 bg-[#333333]">
        <Suspense fallback={<SectionSkeleton />}>
          <ResearchBayanihanSection />
        </Suspense>
      </SectionTheme>

      <SectionTheme theme="light" className="py-6 sm:py-8 md:py-10 bg-white">
        <Suspense fallback={<SectionSkeleton />}>
          <PartnersCarousel />
        </Suspense>
      </SectionTheme>
    </>
  );
};