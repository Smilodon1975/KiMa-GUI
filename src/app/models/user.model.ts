export interface User {
    id: string;
    email: string;
    userName: string;
    firstName?: string;
    lastName?: string;
    title?: string;
    gender?: string;
    status?: string;
    phonePrivate?: string;
    phoneMobile?: string;
    phoneWork?: string;
    birthDate?: string;  // ISO-Format "YYYY-MM-DD"
    age?: number;
    street?: string;
    zip?: string;
    city?: string;
    country?: string;
  }
  