
export type VehicleCategory = 'None' | 'Car' | 'Motorcycle' | 'Other';

export interface UserProfile {
  vehicleCategory: VehicleCategory;
  vehicleDetails?: string;
  occupation?: string;
  educationLevel?: string;
  region?: string;       // z. B. Wohnort oder Region
  age?: number;
  // Wir verwenden hier eine leere Zeichenkette als Default, wenn nichts gewählt wurde
  incomeLevel?: '<1000€' | '1000-5000€' | '>5000€' | '';
  isInterestedInTechnology: boolean;
  isInterestedInSports: boolean;
  isInterestedInEntertainment: boolean;
  isInterestedInTravel: boolean;  
}


  