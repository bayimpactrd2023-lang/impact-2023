import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useContent } from '@/app/context/ContentContext';
import { TeamMember } from '@/app/types/content';
import { Target, Lightbulb, BookOpen, Users } from 'lucide-react';
import { RichTextContent } from '@/app/components/RichTextContent';
import { Card, CardContent } from '@/app/components/ui/card';
import { PageHeaderTheme } from "@/app/components/PageHeaderTheme";
import { SectionTheme } from "@/app/components/SectionTheme";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { PageSkeletonLoader } from "@/app/components/PageSkeletonLoader";
import { TeamMemberDetailModal } from "@/app/components/TeamMemberDetailModal";

export const AboutPage: React.FC = () => {
  const { content, loadingStates, fetchAboutSection, fetchTeamMembers } = useContent();
<<<<<<< HEAD
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

=======
  const [selectedTeamMember, setSelectedTeamMember] =
    useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch data when component mounts
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
  React.useEffect(() => {
    const loadPageData = async () => {
      setPageLoading(true);
      try {
<<<<<<< HEAD
        await Promise.all([fetchAboutSection(), fetchTeamMembers()]);
=======
        await Promise.all([
          fetchAboutSection(),
          fetchTeamMembers(),
        ]);
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
      } catch (error) {
        console.error('[AboutPage] Error fetching page data:', error);
      } finally {
        setPageLoading(false);
      }
    };
<<<<<<< HEAD
=======

>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
    loadPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTeamMemberClick = (member: TeamMember) => {
    setSelectedTeamMember(member);
    setIsModalOpen(true);
  };

<<<<<<< HEAD
  const isLoading = pageLoading || loadingStates.about || loadingStates.teamMembers;
  if (isLoading) return <PageSkeletonLoader message="Loading About Us..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50">
      <PageHeaderTheme theme="transparent" scrollThreshold={700} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <SectionTheme theme="transparent">
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
=======
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
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1656488497988-ca149c86dade?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000"
              alt="Agricultural Research"
              className="absolute inset-0 w-full h-full object-cover"
            />
<<<<<<< HEAD
            <div className="absolute inset-0 bg-gradient-to-br from-[#1887FC]/20 via-blue-900/40 to-[#0b5ab8]/60" />
=======

            {/* Modern Gradient Overlay - Instagram-style */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1887FC]/20 via-blue-900/40 to-[#0b5ab8]/60" />

            {/* Animated Gradient Accent */}
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(circle at 30% 50%, rgba(24,135,252,0.3) 0%, transparent 50%),
                  radial-gradient(circle at 70% 50%, rgba(59,130,246,0.2) 0%, transparent 50%)
                `,
<<<<<<< HEAD
                animation: "gradientShift 10s ease-in-out infinite alternate",
              }}
            />
=======
                animation:
                  "gradientShift 10s ease-in-out infinite alternate",
              }}
            />

            {/* Floating Particles */}
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
<<<<<<< HEAD
                style={{ left: `${Math.random() * 100}%`, bottom: 0 }}
                animate={{ y: [0, -500], x: [0, (Math.random() - 0.5) * 150], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 12 + Math.random() * 8, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }}
              />
            ))}
=======
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
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
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

<<<<<<< HEAD
=======
          {/* Content */}
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
<<<<<<< HEAD
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="text-3xl sm:text-5xl font-bold text-white mb-2"
              style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(24,135,252,0.3)" }}
=======
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
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
            >
              About IMPACT R&D
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto"
<<<<<<< HEAD
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
=======
              style={{
                textShadow: "0 2px 10px rgba(0,0,0,0.3)",
              }}
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
            >
              {content.heroSubtitle || "A DOST-certified Science Foundation dedicated to transformative research and sustainable community development"}
            </motion.p>
          </div>
        </section>
      </SectionTheme>

<<<<<<< HEAD
      {/* ── Mission & Vision — white background, gray text ────────────── */}
=======
      {/* Mission & Vision - Light/White Background */}
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
      <SectionTheme theme="transparent">
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
<<<<<<< HEAD
              {/* Mission */}
=======
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
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
<<<<<<< HEAD
                      <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                    </div>
                    {/*
                      White background → text should be gray (default).
                      Admin blue highlights (#1887FC) come through the HTML as-is.
                      The [&_*]:text-gray-700 rule sets a base color on all child
                      elements; any inline style / class from the admin overrides it.
                    */}
                    <div className="text-lg leading-relaxed text-justify [&_*]:text-gray-700 [&_.text-\[\#1887FC\]]:text-[#1887FC] [&_[style*='color']]:![color:inherit]">
                      <RichTextContent
                        text={content.aboutMission || "To conduct <span class='text-[#1887FC] font-bold'>innovative, research-driven work</span> that advances scientific knowledge and <span class='text-[#1887FC] font-bold'>amplifies societal impact</span> through evidence-based solutions, <span class='text-[#1887FC] font-bold'>collaborative partnerships</span>, and the strengths of a multidisciplinary team"}
                      />
=======
                      <h2 className="text-3xl font-bold text-gray-900">
                        Our Mission
                      </h2>
                    </div>
                    <div className="text-lg text-gray-700 leading-relaxed text-justify">
                      <RichTextContent text={content.aboutMission || "To conduct <span class='text-[#1887FC] font-bold'>innovative, research-driven work</span> that advances scientific knowledge and <span class='text-[#1887FC] font-bold'>amplifies societal impact</span> through evidence-based solutions, <span class='text-[#1887FC] font-bold'>collaborative partnerships</span>, and the strengths of a multidisciplinary team"} />
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

<<<<<<< HEAD
              {/* Vision */}
=======
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
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
<<<<<<< HEAD
                      <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
                    </div>
                    <div className="text-lg leading-relaxed text-justify [&_*]:text-gray-700 [&_.text-\[\#1887FC\]]:text-[#1887FC] [&_[style*='color']]:![color:inherit]">
                      <RichTextContent
                        text={content.aboutVision || "To be one of the <span class='text-[#1887FC] font-bold'>research organizations in the Philippines</span> that strives to make science <span class='text-[#1887FC] font-bold'>more relevant, inclusive, and responsive</span> to community needs and <span class='text-[#1887FC] font-bold'>sustainable development</span>"}
                      />
=======
                      <h2 className="text-3xl font-bold text-gray-900">
                        Our Vision
                      </h2>
                    </div>
                    <div className="text-lg text-gray-700 leading-relaxed text-justify">
                      <RichTextContent text={content.aboutVision || "To be one of the <span class='text-[#1887FC] font-bold'>research organizations in the Philippines</span> that strives to make science <span class='text-[#1887FC] font-bold'>more relevant, inclusive, and responsive</span> to community needs and <span class='text-[#1887FC] font-bold'>sustainable development</span>"} />
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </SectionTheme>

<<<<<<< HEAD
      {/* ── Our Story — dark background, white text ───────────────────── */}
=======
      {/* About Section - Dark Background */}
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
      <SectionTheme theme="transparent">
        <section className="py-20 bg-[#2a2a2a]">
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
                  className="w-14 h-14 bg-gradient-to-br from-[#1887FC] to-[#3b82f6] rounded-2xl flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                >
                  <BookOpen className="w-7 h-7 text-white" />
                </motion.div>
<<<<<<< HEAD
                <h2 className="text-3xl font-bold text-white">Our Story</h2>
              </div>

              {/*
                Dark background → force ALL text to white, but let the admin's
                blue highlights stay blue. We use an inline <style> scoped to this
                wrapper id so it has higher specificity than Tailwind utilities AND
                inline styles set by the rich-text renderer.
              */}
              <div id="our-story-body" className="space-y-6 text-lg leading-relaxed text-justify">
                <style>{`
                  #our-story-body,
                  #our-story-body * {
                    color: #ffffff !important;
                  }
                  #our-story-body [class*="text-[#1887FC]"],
                  #our-story-body [style*="color: #1887FC"],
                  #our-story-body [style*="color:#1887FC"],
                  #our-story-body [style*="color: rgb(24, 135, 252)"],
                  #our-story-body b,
                  #our-story-body strong {
                    color: #1887FC !important;
                  }
                `}</style>
                <RichTextContent
=======
                <h2 className="text-3xl font-bold text-white">
                  Our Story
                </h2>
              </div>

              <div className="space-y-6 text-gray-300 text-lg leading-relaxed text-justify">
                <RichTextContent 
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
                  text={content.aboutDescription || content.aboutText || "IMPACT R&D is a research organization dedicated to transforming scientific research into practical solutions."}
                  className="text-lg leading-relaxed text-justify"
                />
              </div>
            </motion.div>
          </div>
        </section>
      </SectionTheme>

<<<<<<< HEAD
      {/* ── Board Members — white background ─────────────────────────── */}
=======
      {/* Team Section - Light/White Background */}
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
      <SectionTheme theme="transparent">
        <section className="py-20 bg-white">
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
<<<<<<< HEAD
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Board Members</h2>
=======
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Board Members
                </h2>
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
              </div>
              <div className="w-20 h-1 bg-gradient-to-r from-[#1887FC] to-[#4da3fd] mx-auto rounded-full" />
            </motion.div>

            <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
              {(() => {
                const roleOrder = [
<<<<<<< HEAD
                  "president", "vice president", "executive director", "director",
                  "secretary", "treasurer", "board member", "member",
                  "research associate", "research assistant",
=======
                  "president",
                  "vice president",
                  "executive director",
                  "director",
                  "secretary",
                  "treasurer",
                  "board member",
                  "member",
                  "research associate",
                  "research assistant"
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
                ];

                const sortedMembers = [...content.teamMembers].sort((a, b) => {
                  const roleA = a.role?.toLowerCase() || "";
                  const roleB = b.role?.toLowerCase() || "";
                  const nameA = a.name?.toLowerCase() || "";
                  const nameB = b.name?.toLowerCase() || "";

<<<<<<< HEAD
                  const isTBAA = nameA.includes("tba") || roleA.includes("tba");
                  const isTBAB = nameB.includes("tba") || roleB.includes("tba");
                  if (isTBAA && !isTBAB) return 1;
                  if (!isTBAA && isTBAB) return -1;
                  if (isTBAA && isTBAB) return 0;

                  const indexA = roleOrder.findIndex(r => roleA.includes(r));
                  const indexB = roleOrder.findIndex(r => roleB.includes(r));
=======
                  // Handle TBA (To Be Announced) - always at the bottom
                  const isTBAA = nameA.includes("tba") || roleA.includes("tba");
                  const isTBAB = nameB.includes("tba") || roleB.includes("tba");

                  if (isTBAA && !isTBAB) return 1;
                  if (!isTBAA && isTBAB) return -1;
                  if (isTBAA && isTBAB) return 0;
                  
                  const indexA = roleOrder.findIndex(r => roleA.includes(r));
                  const indexB = roleOrder.findIndex(r => roleB.includes(r));
                  
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
                  if (indexA === -1 && indexB === -1) return 0;
                  if (indexA === -1) return 1;
                  if (indexB === -1) return -1;
                  return indexA - indexB;
                });

                return sortedMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
<<<<<<< HEAD
                    transition={{ delay: index * 0.1, duration: 0.6 }}
=======
                    transition={{
                      delay: index * 0.1,
                      duration: 0.6,
                    }}
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
                    viewport={{ once: true }}
                    whileHover={{ y: -8 }}
                    onClick={() => handleTeamMemberClick(member)}
                    className={`cursor-pointer w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-2rem)] max-w-sm ${
<<<<<<< HEAD
                      sortedMembers.length === 1 ? 'lg:w-full max-w-md' :
=======
                      sortedMembers.length === 1 ? 'lg:w-full max-w-md' : 
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
                      sortedMembers.length === 2 && index < 2 ? 'lg:w-[calc(45%-1rem)]' : ''
                    }`}
                  >
                    <Card className="h-full hover:shadow-2xl transition-all duration-300 bg-white border-0 shadow-md">
                      <CardContent className="p-6">
                        {member.imageUrl && (
                          <div className="mb-6 relative w-40 h-40 mx-auto">
                            <ImageWithFallback
                              src={member.imageUrl}
                              alt={member.name}
                              className="w-full h-full rounded-full object-cover border-4 border-[#1887FC] shadow-lg"
                            />
                          </div>
                        )}
                        <div className="text-center">
<<<<<<< HEAD
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                          <p className="text-[#1887FC] font-semibold mb-4 uppercase tracking-wider text-sm">{member.role}</p>
=======
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {member.name}
                          </h3>
                          <p className="text-[#1887FC] font-semibold mb-4 uppercase tracking-wider text-sm">
                            {member.role}
                          </p>
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
                          <div className="text-gray-600 leading-relaxed line-clamp-3">
                            <RichTextContent text={member.description} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ));
              })()}
            </div>
          </div>
        </section>
      </SectionTheme>

<<<<<<< HEAD
=======
      {/* Team Member Detail Modal */}
>>>>>>> b51993d7f8ae96b3cf96478e5add33f8dc59597a
      <TeamMemberDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        teamMember={selectedTeamMember}
      />
    </div>
  );
};