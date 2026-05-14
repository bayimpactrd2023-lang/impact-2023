import type { FC } from 'react';
import { motion } from 'motion/react';
import { useContent } from '@/app/context/ContentContext';
import { Target, Users, Lightbulb, Award, Globe, Star, Zap, Heart, BookOpen, Briefcase, Sparkles } from 'lucide-react';
import { RichTextContent } from '@/app/components/RichTextContent';

// Map icon name strings (stored in DB) to actual Lucide components
const ICON_MAP: Record<string, FC<{ className?: string }>> = {
  Globe, Star, Zap, Heart, BookOpen, Briefcase, Sparkles,
  Target, Users, Lightbulb, Award,
};

export const About: FC = () => {
  const { content } = useContent();

  const values = [
    {
      icon: Target,
      title: 'Research-Driven',
      description: 'Every project backed by solid research foundations',
    },
    {
      icon: Users,
      title: 'Community-Focused',
      description: 'Empowering communities through innovative solutions',
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Translating cutting-edge technology into practical tools',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Commitment to credibility and impactful outcomes',
    },
  ];

  const highlights = content.highlights ?? [];

  return (
    <section id="about" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-white via-blue-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── About header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            About IMPACT R&D
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-[#1887FC] to-[#4da3fd] mx-auto mb-4 sm:mb-6 rounded-full shadow-lg" />
          <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {content.aboutText}
          </p>
        </motion.div>

        {/* ── Values grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-100/50 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-blue-100/50"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#1887FC] to-[#4da3fd] rounded-full mb-3 sm:mb-4 shadow-lg">
                <value.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">{value.title}</h3>
              <p className="text-sm sm:text-base text-gray-600">{value.description}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Highlights ───────────────────────────────────────────── */}
        {highlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 sm:mt-20 md:mt-24"
          >
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Highlights
              </h2>
              <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-[#1887FC] to-[#4da3fd] mx-auto rounded-full shadow-lg" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {highlights.map((highlight, index) => {
                const IconComponent = ICON_MAP[highlight.iconName] ?? Sparkles;

                return (
                  <motion.div
                    key={highlight.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    viewport={{ once: true }}
                    className="group relative flex flex-col rounded-2xl overflow-hidden border border-blue-100/60 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Cover image */}
                    {highlight.imageUrl ? (
                      <div className="relative w-full h-48 overflow-hidden">
                        <img
                          src={highlight.imageUrl}
                          alt={highlight.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#1887FC] to-[#4da3fd] flex items-center justify-center shadow-lg">
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Card body */}
                    <div className="flex flex-col flex-1 p-5 sm:p-6">
                      {/* Icon + title row */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-r from-[#1887FC] to-[#4da3fd] flex items-center justify-center shadow-md">
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                          {highlight.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <div className="text-sm text-gray-600 leading-relaxed line-clamp-3 flex-1">
                        <RichTextContent text={highlight.description} className="text-sm text-gray-600" />
                      </div>

                      {/* Published date */}
                      {highlight.publishedDate && (
                        <p className="mt-4 text-xs text-gray-400 font-medium">
                          {new Date(highlight.publishedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
};