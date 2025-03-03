
import { User } from './user.model';

export type UserUpdateModel = Partial<User> & { id: number; };


// export interface UserUpdateModel {

//   id: string;
//   userName?: string;
//   email?: string;
//   firstName?: string;
//   lastName?: string;
//   title?: string;
//   gender?: string;
//   status?: string;
//   password?: string;

//   // ✅ Telefonnummern
//   phonePrivate?: string;
//   phoneMobile?: string;
//   phoneWork?: string;

//   age?: number;
//   birthDate?: string;

//   // ✅ Adresse
//   street?: string;
//   zip?: string;
//   city?: string;
//   country?: string;
//   role?: string;
  
// }

