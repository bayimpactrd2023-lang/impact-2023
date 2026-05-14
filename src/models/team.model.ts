/**
 * Team Member Model
 * 
 * Defines the structure for team members
 */

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio?: string;
  imageUrl?: string;
  email?: string;
  phone?: string;
}

export interface TeamMemberFormData {
  name: string;
  position: string;
  bio?: string;
  imageUrl?: string;
  email?: string;
  phone?: string;
}
