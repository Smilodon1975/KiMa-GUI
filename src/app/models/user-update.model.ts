
import { User } from './user.model';
import { UserProfile, VehicleCategory } from './user-profile.model';

export interface UserUpdateModel extends User {
  // Falls ein neues Passwort eingegeben wird:
  password?: string;
  // Profil ist hier Pflicht – initialisiere es mit Default‑Werten
  userProfile: UserProfile;
}




  

