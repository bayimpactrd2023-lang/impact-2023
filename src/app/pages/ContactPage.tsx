import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { PageHeaderTheme } from '@/app/components/PageHeaderTheme';
import { SectionTheme } from '@/app/components/SectionTheme';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';

const EMAILJS_SERVICE_ID   = 'service_jm2lv6i';
const EMAILJS_TEMPLATE_ID  = 'template_4h53oxj';  // notification email → you
const EMAILJS_AUTOREPLY_ID = 'template_87aacar';   // auto-reply → sender
const EMAILJS_PUBLIC_KEY   = '2Ulk_zUdHpXuF8K17';

// Generates a ticket like IMP-20260513-4821
const generateTicket = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `IMP-${date}-${rand}`;
};

export const ContactPage: React.FC = () => {
  const [isMapOpen, setIsMapOpen]   = useState(false);
  const [formData, setFormData]     = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted]   = useState(false);
  const [sending, setSending]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [ticketNum, setTicketNum]   = useState<string | null>(null);

  const openGmail = () => {
    window.open('https://mail.google.com/mail/?view=cm&fs=1&to=cabagtongedspencer@gmail.com', '_blank', 'noopener,noreferrer');
  };

  const openPhone = () => {
    window.open('tel:+63495477357');
  };

  const openDirections = () => {
    window.open('https://www.google.com/maps/dir/?api=1&destination=14.1810321,121.2827983', '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;

    setSending(true);
    setError(null);

    const ticket = generateTicket();

    try {
      // 1️⃣ Notify you — includes ticket number so you can reference it when replying
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:     formData.name,
          from_email:    formData.email,
          message:       formData.message,
          ticket_number: ticket,
          to_email:      'cabagtongedspencer@gmail.com',
        },
        EMAILJS_PUBLIC_KEY
      );

      // 2️⃣ Auto-reply to the sender with ticket number + copy of their message
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_AUTOREPLY_ID,
        {
          from_name:     formData.name,
          from_email:    formData.email,
          message:       formData.message,
          ticket_number: ticket,
        },
        EMAILJS_PUBLIC_KEY
      );

      setTicketNum(ticket);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => {
        setSubmitted(false);
        setTicketNum(null);
      }, 8000);
    } catch (err) {
      console.error('EmailJS error:', err);
      setError('Failed to send message. Please try again or email us directly at cabagtongedspencer@gmail.com');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50">
      <PageHeaderTheme theme="transparent" scrollThreshold={700} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
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
                background:
                  'radial-gradient(circle at 30% 50%, rgba(24,135,252,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(59,130,246,0.2) 0%, transparent 50%)',
                animation: 'gradientShift 10s ease-in-out infinite alternate',
              }}
            />
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{ left: `${Math.random() * 100}%`, bottom: 0 }}
                animate={{ y: [0, -500], x: [0, (Math.random() - 0.5) * 150], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 12 + Math.random() * 8, repeat: Infinity, delay: Math.random() * 5, ease: 'linear' }}
              />
            ))}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
              }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
              className="text-3xl sm:text-5xl font-bold text-white mb-2"
              style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(24,135,252,0.3)' }}
            >
              Get in Touch
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-base sm:text-xl text-white/90"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
            >
              Have questions or want to collaborate? We'd love to hear from you.
            </motion.p>
          </div>
        </section>
      </SectionTheme>

      {/* ── Split Contact Card ────────────────────────────────────────── */}
      <SectionTheme theme="light">
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-stretch shadow-2xl rounded-3xl overflow-hidden min-h-[520px]">

              {/* LEFT — blue info panel */}
              <motion.div
                initial={{ x: -80, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="bg-[#1887FC] text-white p-8 sm:p-10 lg:w-[42%] flex flex-col justify-between relative overflow-hidden"
              >
                <div className="relative z-10">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">Contact Us</h2>
                  <p className="text-white/70 text-sm mb-10">
                    Reach out through any of the channels below.
                  </p>

                  <div className="space-y-7">

                    {/* Address */}
                    <button
                      type="button"
                      onClick={() => setIsMapOpen(true)}
                      className="flex items-start gap-4 text-left group w-full bg-transparent border-0 p-0 cursor-pointer"
                    >
                      <div className="mt-0.5 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60 font-semibold uppercase tracking-widest mb-0.5">Address</p>
                        <p className="text-sm text-white font-medium leading-snug">
                          47 Razburg Bldg., Manese St.,
                          <br />
                          San Agustin, Bay, Laguna
                        </p>
                        <p className="text-xs text-white/50 mt-1 group-hover:text-white/80 transition-colors">
                          Click to view map
                        </p>
                      </div>
                    </button>

                    {/* Email */}
                    <button
                      type="button"
                      onClick={openGmail}
                      className="flex items-start gap-4 text-left group w-full bg-transparent border-0 p-0 cursor-pointer"
                    >
                      <div className="mt-0.5 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60 font-semibold uppercase tracking-widest mb-0.5">Email</p>
                        <p className="text-sm text-white font-medium group-hover:underline">
                          cabagtongedspencer@gmail.com
                        </p>
                      </div>
                    </button>

                    {/* Phone */}
                    <button
                      type="button"
                      onClick={openPhone}
                      className="flex items-start gap-4 text-left group w-full bg-transparent border-0 p-0 cursor-pointer"
                    >
                      <div className="mt-0.5 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                        <Phone className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60 font-semibold uppercase tracking-widest mb-0.5">Phone</p>
                        <p className="text-sm text-white font-medium group-hover:underline">
                          (049) 547 7357
                        </p>
                      </div>
                    </button>

                  </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full border-2 border-white/10 pointer-events-none" />
                <div className="absolute -bottom-2 -right-2 w-24 h-24 rounded-full border-2 border-white/10 pointer-events-none" />
              </motion.div>

              {/* RIGHT — form panel */}
              <motion.div
                initial={{ x: 80, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="bg-white p-8 sm:p-10 lg:flex-1 flex flex-col justify-center"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Get in Touch</h2>
                <p className="text-sm text-gray-500 mb-8">Feel free to drop us a line below!</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1887FC]/40 focus:border-[#1887FC] transition-all"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1887FC]/40 focus:border-[#1887FC] transition-all"
                  />
                  <textarea
                    placeholder="Typing your message here…"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1887FC]/40 focus:border-[#1887FC] transition-all resize-none"
                  />

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <span className="mt-0.5 flex-shrink-0">✕</span>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Success — shows ticket number */}
                  {submitted && ticketNum && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 border border-green-200 rounded-xl px-4 py-4 space-y-2"
                    >
                      <p className="text-sm font-semibold text-green-700">
                        Message sent successfully!
                      </p>
                      <p className="text-xs text-green-600">
                        Your ticket number is:
                      </p>
                      <div className="inline-block bg-white border border-green-300 text-green-700 font-bold text-sm px-3 py-1.5 rounded-lg tracking-wide">
                        {ticketNum}
                      </div>
                      <p className="text-xs text-green-600">
                        A confirmation email has been sent to your inbox. We'll reply within 2–3 business days. Please keep your ticket number for reference.
                      </p>
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={sending}
                    whileHover={{ scale: sending ? 1 : 1.02 }}
                    whileTap={{ scale: sending ? 1 : 0.97 }}
                    className="flex items-center gap-2 px-8 py-3 bg-[#1887FC] hover:bg-[#1570d8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-full text-sm transition-colors shadow-md"
                  >
                    {sending ? (
                      <React.Fragment>
                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Sending…
                      </React.Fragment>
                    ) : submitted ? (
                      'Sent! ✓'
                    ) : (
                      <React.Fragment>
                        <Send className="w-4 h-4" />
                        Send
                      </React.Fragment>
                    )}
                  </motion.button>
                </form>
              </motion.div>

            </div>
          </div>
        </section>
      </SectionTheme>

      {/* ── Map Modal ─────────────────────────────────────────────────── */}
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-4xl w-[95%] max-h-[90vh] p-0 overflow-hidden flex flex-col bg-white border-none shadow-2xl">
          <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 flex-shrink-0 bg-white">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">Our Location</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
              47 Razburg Bldg., Manese St., San Agustin, Bay, Laguna
            </DialogDescription>
          </DialogHeader>
          <div className="w-full h-[300px] sm:h-[400px] md:h-[450px] relative bg-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d484.3755965966858!2d121.28220283808163!3d14.181032199999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd5f5745c2ca1b%3A0x13beaeb4f42ed7d1!2sRazburg%20Bldg.!5e0!3m2!1sen!2sph!4v1710800000000!5m2!1sen!2sph"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="IMPACT R&D Location"
            />
          </div>
          <div className="p-4 sm:p-6 pt-3 sm:pt-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 bg-white flex-shrink-0">
            <button
              type="button"
              onClick={openDirections}
              className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-center text-sm sm:text-base"
            >
              Get Directions
            </button>
            <button
              type="button"
              onClick={() => setIsMapOpen(false)}
              className="px-4 sm:px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300 text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};