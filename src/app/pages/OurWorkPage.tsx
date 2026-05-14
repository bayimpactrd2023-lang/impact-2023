import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Globe, Briefcase, Users, BookOpen, FileText } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { PageHeaderTheme } from '@/app/components/PageHeaderTheme';
import { SectionTheme } from '@/app/components/SectionTheme';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export const OurWorkPage: React.FC = () => {
  const navigate = useNavigate();

  const workSections = [
    {
      id: 'rd-projects',
      title: 'R&D Projects',
      description: 'Discover our ongoing and past research initiatives driving innovation in agriculture and sustainable development.',
      icon: Briefcase,
      path: '/our-work/rd-projects',
      gradient: 'from-blue-600 via-blue-500 to-indigo-600',
      textColor: 'text-blue-600'
    },
    {
      id: 'community-transformation',
      title: 'Community Transformation',
      description: 'Empowering communities through outreach activities, workshops, and sustainable development initiatives.',
      icon: Users,
      path: '/our-work/community-transformation',
      gradient: 'from-emerald-600 via-emerald-500 to-teal-600',
      textColor: 'text-emerald-600'
    },
    {
      id: 'technology-spinoffs',
      title: 'Technology Spinoffs',
      description: 'Explore our innovative applications, dashboards, and systems developed from our research findings.',
      icon: Globe,
      path: '/our-work/technology-spinoffs',
      gradient: 'from-violet-600 via-purple-500 to-fuchsia-600',
      textColor: 'text-purple-600'
    },
    {
      id: 'thesis-support',
      title: 'Research and Student Support',
      description: 'Supporting the next generation of researchers through thesis funding, internships, and mentorship programs.',
      icon: BookOpen,
      path: '/our-work/thesis-support',
      gradient: 'from-amber-600 via-orange-500 to-yellow-600',
      textColor: 'text-orange-600'
    },
    {
      id: 'financial-statements',
      title: 'Financial Statements',
      description: 'Transparent financial reporting showing our stewardship of resources for research and community impact.',
      icon: FileText,
      path: '/our-work/financial-statements',
      gradient: 'from-blue-600 via-blue-500 to-indigo-600',
      textColor: 'text-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50">
      <PageHeaderTheme theme="transparent" scrollThreshold={700} />
      
      {/* Hero Section */}
      <SectionTheme theme="transparent">
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1656488497988-ca149c86dade?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000"
              alt="Agricultural Research"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 bg-gradient-to-br from-[#1887FC]/20 via-blue-900/40 to-[#0b5ab8]/60" />
            
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(circle at 30% 50%, rgba(24,135,252,0.3) 0%, transparent 50%),
                  radial-gradient(circle at 70% 50%, rgba(59,130,246,0.2) 0%, transparent 50%)
                `,
                animation: 'gradientShift 10s ease-in-out infinite alternate'
              }}
            />
            
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
                  ease: "linear"
                }}
              />
            ))}
            
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="text-3xl sm:text-5xl font-bold text-white mb-2"
              style={{
                textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(24,135,252,0.3)',
              }}
            >
              Our Work
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-base sm:text-xl text-white/90"
              style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              Discover our diverse portfolio of research, innovation, and community impact
            </motion.p>
          </div>
        </section>
      </SectionTheme>

      {/* Work Sections Grid */}
      <SectionTheme theme="light">
        <section className="py-24 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
              {workSections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.1, 
                      duration: 0.6,
                      ease: [0.21, 0.47, 0.32, 0.98] 
                    }}
                    viewport={{ once: true }}
                    onClick={() => navigate(section.path)}
                    className="group cursor-pointer"
                  >
                    <Card className="h-full border-none shadow-[0_8px_30px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_45px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 overflow-hidden bg-white/80 backdrop-blur-sm rounded-[1.5rem] relative">
                      {/* Decorative Gradient Border on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                      
                      <CardContent className="p-8 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-6">
                          <motion.div 
                            className={`w-16 h-16 bg-gradient-to-br ${section.gradient} rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-500`}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </motion.div>
                          
                          <div className={`text-3xl font-black opacity-5 group-hover:opacity-10 transition-opacity duration-500 ${section.textColor}`}>
                            0{index + 1}
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-[#1887FC] transition-colors leading-tight">
                          {section.title}
                        </h3>
                        
                        <p className="text-gray-600 text-base mb-6 leading-relaxed flex-grow line-clamp-3">
                          {section.description}
                        </p>
                        
                        <div className="mt-auto flex items-center gap-2">
                          <span className={`text-lg font-bold ${section.textColor} flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300`}>
                            Explore Project
                            <svg 
                              width="20" 
                              height="20" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-5"
                            >
                              <path 
                                d="M5 12H19M19 12L13 6M19 12L13 18" 
                                stroke="currentColor" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </div>

                        {/* Bottom Accent Bar */}
                        <motion.div 
                          className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${section.gradient} w-0 group-hover:w-full transition-all duration-500`}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </SectionTheme>
    </div>
  );
};