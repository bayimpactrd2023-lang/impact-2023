import React, { useState } from "react";
import { motion } from "motion/react";
import { useContent } from "@/app/context/ContentContext";
import { User, Calendar, ExternalLink } from "lucide-react";
import { BlogPost } from "@/app/context/ContentContext";
import { useNavigate } from "react-router";
import { BlogDetailModal } from "@/app/components/BlogDetailModal";

export const BlogSection: React.FC = () => {
  const { content } = useContent();
  const navigate = useNavigate();
  const [selectedBlog, setSelectedBlog] =
    useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReadMore = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
  };

  // Filter to show only featured blog posts (max 3)
  const featuredBlogs = content.blogPosts.slice(0, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section
      id="blog"
      className="py-24 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.98) 30%, rgba(255,255,255,1) 100%)",
      }}
    >
      {/* Background Elements */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, rgba(24, 135, 252, 0.08) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
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

            <h2
              className="relative text-4xl sm:text-5xl font-bold mb-4"
              style={{
                background:
                  "linear-gradient(135deg, #1887FC 0%, #3b82f6 50%, #60a5fa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.02em",
              }}
            >
              Latest Stories
            </h2>
          </motion.div>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#1887FC] to-transparent mx-auto rounded-full shadow-lg" />
        </motion.div>

        <div className="space-y-8">
          {featuredBlogs.map((blog, index) => (
            <motion.article
              key={blog.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
              }}
              viewport={{ once: true }}
              className="card-futuristic group cursor-pointer p-8 hover:shadow-xl transition-all duration-300"
              onClick={() => handleReadMore(blog)}
            >
              {/* Story Header */}
              <div className="mb-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-[#1887FC] transition-colors">
                  {blog.title}
                </h3>

                {/* Story Preview - First 3 lines of content */}
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed line-clamp-3 mb-4 whitespace-pre-wrap">
                  {blog.content}
                </p>

                {/* Read More Button */}
                <motion.button
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReadMore(blog);
                  }}
                  className="inline-flex items-center gap-2 text-[#1887FC] font-semibold hover:gap-3 transition-all duration-300"
                >
                  <span>Read more</span>
                  <ExternalLink className="w-4 h-4" strokeWidth={2} />
                </motion.button>
              </div>

              {/* Author & Date - Story-style */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-300">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4 text-[#1887FC]" strokeWidth={2} />
                  <span className="font-medium text-gray-900">
                    {blog.author}
                  </span>
                  {blog.authorRole && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span>{blog.authorRole}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-[#1887FC]" strokeWidth={2} />
                  <span>{formatDate(blog.date)}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* View All Blog Posts Button */}
        {content.blogPosts.length > 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <motion.button
              onClick={() => navigate("/blog")}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-10 py-5 bg-gradient-to-r from-[#1887FC] via-[#3b82f6] to-[#60a5fa] text-white rounded-2xl font-bold text-lg overflow-hidden shadow-2xl hover:shadow-blue-500/50 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <span className="relative z-10 flex items-center gap-3">
                View All Stories
                <span className="inline-block group-hover:translate-x-2 transition-transform text-2xl">
                  →
                </span>
              </span>
            </motion.button>
          </motion.div>
        )}
      </div>

      <BlogDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        blogPost={selectedBlog}
      />
    </section>
  );
};