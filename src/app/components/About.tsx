import type { FC } from 'react';
import { motion } from 'motion/react';
import { useContent } from '@/app/context/ContentContext';
import { Target, Users, Lightbulb, Award } from 'lucide-react';

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

  return (
    <section id="about" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-white via-blue-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
            About IMPACT R&D
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-[#1887FC] to-[#4da3fd] mx-auto mb-4 sm:mb-6 rounded-full shadow-lg" />
          <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {content.aboutText}
          </p>
        </motion.div>

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
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#1887FC] to-[#4da3fd] rounded-full mb-3 sm:mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <value.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">{value.title}</h3>
              <p className="text-sm sm:text-base text-gray-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};