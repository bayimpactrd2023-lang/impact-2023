import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Heart, Users, Award, TrendingUp } from 'lucide-react';

export const ResearchBayanihanSection: React.FC = React.memo(() => {
  const highlights = useMemo(() => [
    {
      icon: Heart,
      title: "Community-Driven Research",
      description: "Empowering local communities through participatory research initiatives"
    },
    {
      icon: Users,
      title: "Collaborative Network",
      description: "Connecting researchers, farmers, and stakeholders for impactful solutions"
    },
    {
      icon: Award,
      title: "Evidence-Based Impact",
      description: "Creating measurable change through rigorous scientific research"
    },
    {
      icon: TrendingUp,
      title: "Sustainable Growth",
      description: "Building long-term capacity for agricultural development"
    }
  ], []);

  return (
    <section id="research-bayanihan" className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(24, 135, 252, 0.15) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      {/* Floating Orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-br from-[#1887FC]/10 to-blue-400/5 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-[#1887FC]/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12 md:mb-14 lg:mb-16"
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
                color: 'white',
                letterSpacing: '-0.02em',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              <span>Research</span><span style={{
                color: '#60a5fa'
              }}>Bayanihan</span>
            </h2>
          </motion.div>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-transparent via-[#1887FC] to-transparent mx-auto mb-3 sm:mb-4 md:mb-5 rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="bg-[#2a2a2a] p-8 rounded-2xl border border-white/5 shadow-2xl">
              <p className="text-lg text-white/90 leading-relaxed mb-6">
                <span className="font-bold text-white text-xl">Research</span><span className="font-bold text-xl" style={{ color: '#60a5fa' }}>Bayanihan</span> is a groundbreaking initiative that brings together communities, researchers, and stakeholders to co-create sustainable solutions for agricultural development and community empowerment.
              </p>
              <p className="text-base text-gray-400 leading-relaxed mb-6">
                Through this collaborative platform, we foster a spirit of "bayanihan" – the Filipino tradition of communal unity and cooperation – in research and development. Our approach ensures that research outcomes are rooted in local knowledge, culturally appropriate, and directly address community needs.
              </p>
              <p className="text-base text-gray-400 leading-relaxed">
                Join us in creating meaningful impact through participatory research that transforms lives and strengthens communities across the Philippines.
              </p>
            </div>
          </motion.div>

          {/* Right: Highlights */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {highlights.map((highlight, index) => {
              const Icon = highlight.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-[#2a2a2a] p-6 rounded-2xl border border-white/5 group hover:border-[#1887FC]/30 transition-all duration-300 shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#1887FC]/20 rounded-xl flex items-center justify-center group-hover:bg-[#1887FC] transition-all duration-300">
                      <Icon className="w-6 h-6 text-[#1887FC] group-hover:text-white" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#1887FC] transition-colors">
                        {highlight.title}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {highlight.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Call to Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.a
            href="https://www.impactofresearch.fund/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="group relative inline-flex items-center gap-4 px-10 py-5 bg-[#1887FC] text-white rounded-2xl font-bold text-lg overflow-hidden shadow-[0_8px_30px_rgba(24,135,252,0.4)] hover:shadow-[0_8px_40px_rgba(24,135,252,0.6)] transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <span className="relative z-10 flex items-center gap-3">
              Visit ResearchBayanihan
              <ExternalLink className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </span>
          </motion.a>
          <p className="mt-4 text-sm text-gray-400">
            Discover how you can be part of this transformative movement
          </p>
        </motion.div>
      </div>
    </section>
  );
});