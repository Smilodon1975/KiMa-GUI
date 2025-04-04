import { UserProfile } from './user-profile.model';

export interface User {
  id: number;  
  role?: string;
  email: string;
  createdAt?: string;
  userName?: string;
  firstName?: string;  
  lastName?: string;   
  title?: string;
  gender?: string;
  status?: string;
  phonePrivate?: string;
  phoneMobile?: string;
  phoneWork?: string;
  age?: number;
  birthDate?: string;
  street?: string;
  zip?: string;
  city?: string;
  country?: string;  
  profile?: UserProfile; // Optional im Basis‑Objekt
}
