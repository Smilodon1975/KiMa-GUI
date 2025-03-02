
export interface UserUpdateModel {

  id: number;
  userName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  gender?: string;
  status?: string;
  password?: string;

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

