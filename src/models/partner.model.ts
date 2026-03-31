/**
 * Partner Model
 * 
 * Defines the structure for partner organizations
 */

export interface Partner {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  websiteUrl?: string;
}

export interface PartnerFormData {
  name: string;
  logoUrl?: string;
  description?: string;
  websiteUrl?: string;
}
