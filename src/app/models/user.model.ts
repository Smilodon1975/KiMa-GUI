

export interface User {
  //Identifikation
  id: number;  
  email: string;
  password: string;
  createdAt?: string;

  userName?: string;
  firstName?: string;  
  lastName?: string;   
  title?: string;
  gender?: string;
  status?: string;
  
  // ✅ Telefonnummern
  phonePrivate?: string;
  phoneMobile?: string;
  phoneWork?: string;

  age?: number;
  birthDate?: string;

  // ✅ Adresse
  street?: string;
  zip?: string;
  city?: string;
  country?: string;

  role?: string;
}

  