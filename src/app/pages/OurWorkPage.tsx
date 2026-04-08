import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Globe, Briefcase, Users, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { PageHeaderTheme } from '@/app/components/PageHeaderTheme';
import { SectionTheme } from '@/app/components/SectionTheme';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export const OurWorkPage: React.FC = () => {
  const navigate = useNavigate();

  // No loading state or data fetching needed - this is a navigation page

  const workSections = [
    {
      id: 'internationally-funded',
      title: 'Internationally Funded Projects',
      description: 'Project overview required i and add below it Objectives and Methodology and Activities',
      icon: Globe,
      path: '/our-work/internationally-funded',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'locally-funded',
      title: 'Locally Funded Projects',
      description: 'Project overview required i and add below it Objectives and Methodology and Activities',
      icon: Briefcase,
      path: '/our-work/locally-funded',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'community-transformation',
      title: 'Community Transformation',
      description: 'Empowering communities through sustainable development and transformation programs.',
      icon: Users,
      path: '/our-work/community-transformation',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'internship-program',
      title: 'Internship Program',
      description: 'Real stories, real growth. Testimonials from our interns about their transformative experiences.',
      icon: Users,
      path: '/our-work/internship-program',
      gradient: 'from-pink-500 to-pink-600'
    },
    {
      id: 'study-findings',
      title: 'Study Findings',
      description: 'Research insights and discoveries shaping agricultural innovation and development.',
      icon: TrendingUp,
      path: '/our-work/study-findings',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      id: 'financial-statements',
      title: 'Financial Statements',
      description: 'Transparent financial reports demonstrating our commitment to accountability and governance.',
      icon: DollarSign,
      path: '/our-work/financial-statements',
      gradient: 'from-emerald-500 to-emerald-600'
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
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {workSections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8 }}
                    onClick={() => navigate(section.path)}
                    className="cursor-pointer"
                  >
                    <Card className="h-full hover:shadow-2xl transition-all duration-300 border-0 shadow-md overflow-hidden group">
                      <CardContent className="p-6 sm:p-8">
                        <motion.div 
                          className={`w-16 h-16 bg-gradient-to-br ${section.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-elegant`}
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </motion.div>
                        
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#1887FC] transition-colors">
                          {section.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {section.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-[#1887FC] font-semibold group-hover:translate-x-2 transition-transform">
                            Explore →
                          </span>
                        </div>
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