import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useContent } from '@/app/context/ContentContext';
import { TeamMember } from '@/app/types/content';
import { Target, Lightbulb, BookOpen, Users } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { PageHeaderTheme } from "@/app/components/PageHeaderTheme";
import { SectionTheme } from "@/app/components/SectionTheme";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { PageSkeletonLoader } from "@/app/components/PageSkeletonLoader";
import { TeamMemberDetailModal } from "@/app/components/TeamMemberDetailModal";
import { getImageUrl } from '@/utils/r2Upload';

export const AboutPage: React.FC = () => {
  const { content, loadingStates, fetchAboutSection, fetchTeamMembers } = useContent();
  const [selectedTeamMember, setSelectedTeamMember] =
    useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch data when component mounts
  React.useEffect(() => {
    const loadPageData = async () => {
      setPageLoading(true);
      try {
        await Promise.all([
          fetchAboutSection(),
          fetchTeamMembers(),
        ]);
      } catch (error) {
        console.error('[AboutPage] Error fetching page data:', error);
      } finally {
        setPageLoading(false);
      }
    };

    loadPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTeamMemberClick = (member: TeamMember) => {
    setSelectedTeamMember(member);
    setIsModalOpen(true);
  };

  // Show loading state on the page itself
  const isLoading = pageLoading || loadingStates.about || loadingStates.teamMembers;
  
  if (isLoading) {
    return <PageSkeletonLoader message="Loading About Us..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50">
      <PageHeaderTheme
        theme="transparent"
        scrollThreshold={700}
      />

      {/* Hero Section - Match Home Page Style */}
      <SectionTheme theme="transparent">
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          {/* High-Quality Background Image with Overlay */}
          <div className="absolute inset-0">
            {/* Agricultural Research Image */}
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1656488497988-ca149c86dade?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000"
              alt="Agricultural Research"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Modern Gradient Overlay - Instagram-style */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1887FC]/20 via-blue-900/40 to-[#0b5ab8]/60" />

            {/* Animated Gradient Accent */}
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

            {/* Floating Particles */}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: 0,
                }}
                animate={{
                  y: [0, -500],
                  x: [0, (Math.random() - 0.5) * 150],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 12 + Math.random() * 8,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "linear",
                }}
              />
            ))}

            {/* Futuristic Grid Overlay */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: "50px 50px",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: "easeOut",
              }}
              className="text-3xl sm:text-5xl font-bold text-white mb-2"
              style={{
                textShadow:
                  "0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(24,135,252,0.3)",
              }}
            >
              About IMPACT R&D
            </motion.h1>
            {content.heroSubtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-base sm:text-xl text-white/90"
                style={{
                  textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                }}
              >
                {content.heroSubtitle}
              </motion.p>
            )}
          </div>
        </section>
      </SectionTheme>

      {/* Mission & Vision */}
      <SectionTheme theme="light">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full glass-card border-0 transition-all duration-300">
                  <CardContent className="p-8 sm:p-10">
                    <div className="flex items-center gap-4 mb-6">
                      <motion.div
                        className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-elegant"
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Target className="w-8 h-8 text-white" />
                      </motion.div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        Our Mission
                      </h2>
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {content.aboutMission || "To deliver innovative research-driven solutions that address agricultural challenges, environmental sustainability, and community development needs across the Philippines through science-based methodologies and collaborative partnerships."}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full glass-card border-0 transition-all duration-300">
                  <CardContent className="p-8 sm:p-10">
                    <div className="flex items-center gap-4 mb-6">
                      <motion.div
                        className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-elegant"
                        whileHover={{ rotate: -10, scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Lightbulb className="w-8 h-8 text-white" />
                      </motion.div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        Our Vision
                      </h2>
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {content.aboutVision || "To be a leading research organization in the Philippines, recognized for transforming scientific research into practical solutions that empower communities and promote sustainable development across the nation."}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </SectionTheme>

      {/* About Section */}
      <SectionTheme theme="light">
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center gap-4 mb-8">
                <motion.div
                  className="w-14 h-14 bg-gradient-to-br from-[#1887FC] to-[#0b5ab8] rounded-2xl flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                >
                  <BookOpen className="w-7 h-7 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Our Story
                </h2>
              </div>

              <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                <div
                  dangerouslySetInnerHTML={{
                    __html: content.aboutDescription || content.aboutText || "IMPACT R&D is a research organization dedicated to transforming scientific research into practical solutions."
                  }}
                  className="prose prose-lg max-w-none"
                />
              </div>
            </motion.div>
          </div>
        </section>
      </SectionTheme>

      {/* Team Section */}
      <SectionTheme theme="light">
        <section className="py-20 bg-gradient-to-br from-blue-50 via-blue-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <motion.div
                  className="w-14 h-14 bg-gradient-to-br from-[#1887FC] to-[#0b5ab8] rounded-2xl flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Users className="w-7 h-7 text-white" />
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Our Team
                </h2>
              </div>
              <div className="w-20 h-1 bg-gradient-to-r from-[#1887FC] to-[#4da3fd] mx-auto rounded-full" />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {content.teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.6,
                  }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  onClick={() => handleTeamMemberClick(member)}
                  className="cursor-pointer"
                >
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 bg-white border-0 shadow-md">
                    <CardContent className="p-6">
                      {member.imageUrl && (
                        <div className="mb-6">
                          <motion.img
                            src={getImageUrl(member.imageUrl)}
                            alt={member.name}
                            className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-[#1887FC] shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      )}
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {member.name}
                        </h3>
                        <p className="text-[#1887FC] font-semibold mb-4">
                          {member.role}
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                          {member.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </SectionTheme>

      {/* Team Member Detail Modal */}
      <TeamMemberDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        teamMember={selectedTeamMember}
      />
    </div>
  );
};