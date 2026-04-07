import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { PageHeaderTheme } from '@/app/components/PageHeaderTheme';
import { SectionTheme } from '@/app/components/SectionTheme';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';

export const ContactPage: React.FC = () => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  // No loading state needed - this page doesn't fetch data
  
  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'main@impactrd.org',
      link: 'mailto:main@impactrd.org',
      clickable: true
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '(049) 547 7357',
      link: 'tel:+63495477357',
      clickable: true
    },
    {
      icon: MapPin,
      label: 'Address',
      value: '47 Razburg Bldg., Manese St., San Agustin, Bay, Laguna',
      link: '#',
      clickable: false,
      onClick: () => setIsMapOpen(true)
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50">
      <PageHeaderTheme theme="transparent" scrollThreshold={700} />
      
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
                animation: 'gradientShift 10s ease-in-out infinite alternate'
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
                  ease: "linear"
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
                backgroundSize: '50px 50px'
              }}
            />
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            >
              <h1 
                className="text-3xl sm:text-5xl font-bold text-white mb-2"
                style={{
                  textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(24,135,252,0.3)',
                }}
              >
                Get in Touch
              </h1>
              <p 
                className="text-base sm:text-xl text-white/90"
                style={{
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}
              >
                Have questions or want to collaborate? We'd love to hear from you.
              </p>
            </motion.div>
          </div>
        </section>
      </SectionTheme>

      {/* Contact Information */}
      <SectionTheme theme="light">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.div
                    key={info.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <Card 
                      className={`h-full glass-card border-0 transition-all duration-300 text-center ${
                        !info.clickable ? 'cursor-pointer hover:shadow-xl hover:border-[#1887FC]/30 border border-transparent' : ''
                      }`}
                      onClick={info.onClick}
                    >
                      <CardContent className="p-6 sm:p-8">
                        <motion.div 
                          className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-elegant"
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </motion.div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{info.label}</h3>
                        {info.clickable ? (
                          <a 
                            href={info.link}
                            className="text-sm sm:text-base text-gray-600 hover:text-[#1887FC] transition-colors font-medium break-words"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-sm sm:text-base text-gray-600 font-medium break-words">
                            {info.value}
                          </p>
                        )}
                        {!info.clickable && (
                          <p className="text-xs text-[#1887FC] mt-2 font-semibold">Click to view map</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </SectionTheme>

      {/* Google Maps Modal */}
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-4xl w-[95%] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">Our Location</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-2">
              47 Razburg Bldg., Manese St., San Agustin, Bay, Laguna
            </DialogDescription>
          </DialogHeader>
          <div className="w-full h-[500px] relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d484.3755965966858!2d121.28220283808163!3d14.181032199999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd5f5745c2ca1b%3A0x13beaeb4f42ed7d1!2sRazburg%20Bldg.!5e0!3m2!1sen!2sph!4v1710800000000!5m2!1sen!2sph"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="IMPACT R&D Location - Razburg Building"
            />
          </div>
          <div className="p-6 pt-4 flex justify-end gap-3 bg-gray-50">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=14.1810321,121.2827983&destination_place_id=ChIJG8rCRVdfvTMR0dcu9LTuvu4T"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              Get Directions
            </a>
            <button
              onClick={() => setIsMapOpen(false)}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};