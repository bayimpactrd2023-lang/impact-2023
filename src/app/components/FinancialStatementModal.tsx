import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Download, FileText, Calendar, Eye } from "lucide-react";
import { FinancialStatement } from "@/app/context/ContentContext";
import { Button } from "@/app/components/ui/button";
import { downloadPDF } from "@/utils/downloadHelpers";

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
      <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl p-0">
        <DialogHeader className="sr-only">
          <DialogTitle className="sr-only">
            {statement.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Financial statement details for {statement.year}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto scrollbar-hide max-h-[90vh]">
          {/* Header Section with Icon */}
          <div className="bg-gradient-to-br from-[#1887FC] to-[#0b5ab8] p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {statement.year}
            </h2>
            <p className="text-white/90 text-lg">
              Financial Statement
            </p>
          </div>

          {/* Content Section */}
          <div className="p-6 sm:p-8">
            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {statement.title}
            </h3>

            {/* Year Badge */}
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-4 h-4 text-[#1887FC]" />
              <span className="text-sm font-semibold text-[#1887FC]">
                Fiscal Year {statement.year}
              </span>
            </div>

            {/* Description */}
            {statement.description && (
              <div className="mb-6">
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Overview
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {statement.description}
                  </p>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <p className="text-xs text-gray-600">
                This financial statement provides a comprehensive overview of IMPACT R&D's 
                financial activities for the fiscal year {statement.year}. It demonstrates 
                our commitment to transparency and accountability in the use of resources 
                for agricultural research and community development.
              </p>
            </div>

            {/* PDF Access Buttons */}
            {statement.pdfUrl && (
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                {statement.pdfAccessType === 'view' ? (
                  // View Only - Open in modal viewer
                  <>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        if (onViewPDF) {
                          onViewPDF(statement.pdfUrl, statement.title, statement.year);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#0b5ab8] hover:to-[#2563eb] text-white font-semibold shadow-md hover:shadow-lg transition-all"
                      size="lg"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      View PDF
                    </Button>
                    <p className="text-xs text-center text-gray-500">
                      The PDF will open in the viewer
                    </p>
                  </>
                ) : (
                  // Downloadable - Can download
                  <>
                    <div className="flex gap-3">
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          if (onViewPDF) {
                            onViewPDF(statement.pdfUrl, statement.title, statement.year);
                          }
                        }}
                        variant="outline"
                        className="flex-1"
                        size="lg"
                      >
                        <Eye className="w-5 h-5 mr-2" />
                        View PDF
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          downloadPDF(statement.pdfUrl, statement.title, statement.year);
                        }}
                        className="flex-1 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#0b5ab8] hover:to-[#2563eb] text-white font-semibold shadow-md hover:shadow-lg transition-all"
                        size="lg"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                    <p className="text-xs text-center text-gray-500">
                      View the PDF in the viewer or download it to your device
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};