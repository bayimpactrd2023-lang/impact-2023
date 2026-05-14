import React, { useState, useMemo, useEffect } from 'react';
import { useContent } from '@/app/context/ContentContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { PageHeaderTheme } from '@/app/components/PageHeaderTheme';
import { motion } from 'motion/react';
import { SectionTheme } from '@/app/components/SectionTheme';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Pagination } from '@/app/components/Pagination';
import { PageSkeletonLoader } from '@/app/components/PageSkeletonLoader';
import { FileText, Download, Eye } from 'lucide-react';
import { FinancialStatementModal } from '@/app/components/FinancialStatementModal';
import { PDFViewerModal } from '@/app/components/PDFViewerModal';
import { FinancialStatement } from '@/app/context/ContentContext';
import { downloadPDF } from '@/utils/downloadHelpers';

const ITEMS_PER_PAGE = 6;

export const FinancialStatementsPage: React.FC = () => {
  const { content, loadingStates, fetchFinancialStatements } = useContent();
  const [pageLoading, setPageLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatement, setSelectedStatement] = useState<FinancialStatement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);
  const [pdfToView, setPdfToView] = useState<{ url: string; title: string; year: string } | null>(null);
  
  // Fetch data when component mounts
  useEffect(() => {
    const loadPageData = async () => {
      setPageLoading(true);
      try {
        await fetchFinancialStatements();
      } finally {
        setPageLoading(false);
      }
    };

    loadPageData();
  }, []);

  const totalPages = Math.ceil(content.financialStatements.length / ITEMS_PER_PAGE);
  const currentStatements = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return content.financialStatements.slice(start, start + ITEMS_PER_PAGE);
  }, [content.financialStatements, currentPage]);

  // Show loading state
  if (pageLoading || loadingStates.financialStatements) {
    return <PageSkeletonLoader message="Loading Financial Statements..." />;
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCardClick = (statement: FinancialStatement) => {
    // Open modal to show details and allow download
    openModal(statement);
  };

  const openModal = (statement: FinancialStatement) => {
    setSelectedStatement(statement);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedStatement(null);
    setIsModalOpen(false);
  };

  const openPDFViewer = (url: string, title: string, year: string) => {
    setPdfToView({ url, title, year });
    setIsPDFViewerOpen(true);
  };

  const closePDFViewer = () => {
    setPdfToView(null);
    setIsPDFViewerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
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
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="text-3xl sm:text-5xl font-bold text-white mb-2"
              style={{
                textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(24,135,252,0.3)',
              }}
            >
              Financial Statements
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-base sm:text-xl text-white/90 max-w-3xl mx-auto"
              style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              Transparent reporting of our financial performance and accountability.
            </motion.p>
          </div>
        </section>
      </SectionTheme>

      {/* Content Section - Match Publications Layout */}
      <SectionTheme theme="light">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Keyed container for React re-mounting */}
            <div key={currentPage}>
              {content.financialStatements.length === 0 ? (
                <div className="text-center py-24">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#1887FC]/10 to-blue-100 mb-6">
                    <FileText className="w-10 h-10 text-[#1887FC]" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Financial Statements Yet</h3>
                  <p className="text-gray-600 text-base max-w-md mx-auto">
                    Financial statements have not been uploaded yet. Check back later for transparency reports!
                  </p>
                </div>
              ) : (
                <>
                  {/* Document-style List Layout */}
                  <div className="space-y-6">
                    {currentStatements.map((statement, index) => (
                      <motion.div
                        key={statement.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <Card 
                          className="hover:shadow-xl transition-all duration-300 border-0 shadow-md cursor-pointer"
                          onClick={() => handleCardClick(statement)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-xl font-bold text-gray-900 hover:text-[#1887FC] transition-colors">
                                  {statement.title}
                                </CardTitle>
                                <CardDescription className="text-gray-600 mt-1">
                                  Financial Year {statement.year}
                                </CardDescription>
                              </div>
                              <div className="ml-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100">
                                  <FileText className="w-8 h-8 text-[#1887FC]" />
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {statement.description && (
                              <p className="text-gray-700 mb-4 leading-relaxed">
                                {statement.description}
                              </p>
                            )}
                            <div className="flex gap-3 mt-4">
                              {statement.pdfUrl && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openPDFViewer(statement.pdfUrl, statement.title, statement.year);
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1887FC] hover:bg-[#0b5ab8] text-white rounded-lg font-medium transition-colors text-sm shadow-sm hover:shadow-md"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View PDF
                                  </button>
                                  {statement.pdfAccessType === 'download' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        downloadPDF(statement.pdfUrl, `${statement.title} - ${statement.year}`);
                                      }}
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm border border-gray-300"
                                    >
                                      <Download className="w-4 h-4" />
                                      Download PDF
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={ITEMS_PER_PAGE}
                      totalItems={content.financialStatements.length}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </SectionTheme>

      {/* Modal */}
      <FinancialStatementModal
        statement={selectedStatement}
        isOpen={isModalOpen}
        onClose={closeModal}
        onViewPDF={(url, title, year) => {
          closeModal();
          openPDFViewer(url, title, year);
        }}
      />

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={isPDFViewerOpen}
        onClose={closePDFViewer}
        pdfUrl={pdfToView?.url || ''}
        title={pdfToView?.title || ''}
        year={pdfToView?.year}
      />
    </div>
  );
};