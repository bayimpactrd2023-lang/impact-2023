import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Download, FileText, Calendar, Eye, Shield, CheckCircle } from "lucide-react";
import { FinancialStatement } from "@/app/context/ContentContext";
import { Button } from "@/app/components/ui/button";
import { downloadPDF } from "@/utils/downloadHelpers";
import { motion } from "motion/react";

interface FinancialStatementModalProps {
  statement: FinancialStatement | null;
  isOpen: boolean;
  onClose: () => void;
  onViewPDF?: (url: string, title: string, year: string) => void;
}

export const FinancialStatementModal: React.FC<
  FinancialStatementModalProps
> = ({ statement, isOpen, onClose, onViewPDF }) => {
  if (!statement) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl max-h-[90vh] overflow-hidden bg-white border-none shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] rounded-3xl p-0">
        <DialogHeader className="sr-only">
          <DialogTitle className="sr-only">{statement.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Financial statement details for {statement.year}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto scrollbar-hide max-h-[90vh]">
          {/* Hero Header Section */}
          <div className="relative bg-gradient-to-br from-[#1887FC] via-[#3b82f6] to-[#0b5ab8] p-10 sm:p-14 text-center overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              {/* Document Icon Container */}
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-[2rem] bg-white/20 backdrop-blur-md shadow-2xl border border-white/30 mb-8 transform hover:scale-105 transition-transform duration-300">
                <FileText className="w-14 h-14 text-white" strokeWidth={1.5} />
              </div>

              <div className="flex flex-col items-center gap-4">
                {/* Year Badge */}
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-inner"
                >
                  <Calendar className="w-4 h-4 text-white" />
                  <span className="text-white font-bold text-sm tracking-wide">
                    FISCAL YEAR {statement.year}
                  </span>
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Financial Statement
                  </h2>
                  <p className="text-white/70 text-sm font-medium uppercase tracking-[0.2em]">
                    Official Transparency Document
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Content Section */}
          <div className="p-8 sm:p-12 space-y-10">
            {/* Title Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#1887FC]/20 to-[#3b82f6]/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <div className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                    {statement.title}
                  </h3>
                </div>
              </div>
            </motion.div>

            {/* Overview Section */}
            {statement.description && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1887FC]/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#1887FC]" />
                  </div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                    Document Overview
                  </h4>
                </div>
                <div className="bg-gray-50/50 p-6 sm:p-8 rounded-2xl border border-gray-100/50">
                  <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap text-justify">
                    {statement.description}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Trust Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className="flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-100/50 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-50">
                  <CheckCircle className="w-6 h-6 text-[#1887FC]" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-gray-900 text-base">
                    Official Financial Verification
                  </h5>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    This document is a verified financial disclosure for fiscal year {statement.year}, reflecting our ongoing commitment to institutional accountability and fiscal transparency.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            {statement.pdfUrl && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="pt-4"
              >
                {statement.pdfAccessType === 'view' ? (
                  <div className="space-y-4">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        if (onViewPDF) {
                          onViewPDF(statement.pdfUrl, statement.title, statement.year);
                        }
                      }}
                      className="w-full h-16 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#0b5ab8] hover:to-[#2563eb] text-white font-bold text-lg shadow-[0_10px_30px_-10px_rgba(24,135,252,0.5)] hover:shadow-[0_15px_35px_-10px_rgba(24,135,252,0.6)] hover:-translate-y-0.5 transition-all duration-300 rounded-2xl group"
                    >
                      <Eye className="w-6 h-6 mr-3 transition-transform group-hover:scale-110" />
                      View PDF Document
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                      <div className="w-1 h-1 rounded-full bg-gray-300" />
                      SECURE ONLINE VIEWING ENABLED
                      <div className="w-1 h-1 rounded-full bg-gray-300" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          if (onViewPDF) {
                            onViewPDF(statement.pdfUrl, statement.title, statement.year);
                          }
                        }}
                        variant="outline"
                        className="h-16 border-2 border-gray-100 hover:border-[#1887FC] hover:bg-blue-50/30 text-gray-700 hover:text-[#1887FC] font-bold text-lg rounded-2xl transition-all duration-300 group"
                      >
                        <Eye className="w-6 h-6 mr-2 transition-transform group-hover:scale-110" />
                        View
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          downloadPDF(statement.pdfUrl, statement.title, statement.year);
                        }}
                        className="h-16 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#0b5ab8] hover:to-[#2563eb] text-white font-bold text-lg shadow-[0_10px_30px_-10px_rgba(24,135,252,0.5)] hover:shadow-[0_15px_35px_-10px_rgba(24,135,252,0.6)] hover:-translate-y-0.5 transition-all duration-300 rounded-2xl group"
                      >
                        <Download className="w-6 h-6 mr-2 transition-transform group-hover:translate-y-0.5" />
                        Download
                      </Button>
                    </div>
                    <p className="text-xs text-center text-gray-400 font-bold uppercase tracking-wider">
                      Authorized Access Only
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};