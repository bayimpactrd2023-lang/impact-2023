/**
 * Project Model
 * 
 * Defines the structure for research projects
 */

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'ongoing' | 'completed' | 'planned';
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  fundingSource?: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  status: 'ongoing' | 'completed' | 'planned';
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  fundingSource?: string;
}
