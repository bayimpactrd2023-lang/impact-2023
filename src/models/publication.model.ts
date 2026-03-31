/**
 * Publication Model
 * 
 * Defines the structure for research publications
 */

export interface Publication {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  year: string;
  journal?: string;
  doi?: string;
  pdfUrl?: string;
  imageUrl?: string;
  featured?: boolean;
}

export interface PublicationFormData {
  title: string;
  authors: string;
  abstract: string;
  year: string;
  journal?: string;
  doi?: string;
  pdfUrl?: string;
  imageUrl?: string;
  featured?: boolean;
}
