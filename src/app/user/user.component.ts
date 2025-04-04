import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../models/user.model';
import { UserProfile } from '../models/user-profile.model';
import { VehicleCategory } from '../models/user-profile.model';
import { UserUpdateModel } from '../models/user-update.model';
import * as bootstrap from 'bootstrap';
import { CountryService } from '../services/country.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class UserComponent implements OnInit {
  loginMessage: string | null = '';
  userData: User | null = null;
  userProfile: UserProfile | null = null; // Benutzerprofil
  updatedUserData: UserUpdateModel = {} as UserUpdateModel; 
  successMessage = '';
  errorMessage = '';
  fadeOut: boolean = false;
  confirmPassword: string = '';
  passwordMismatch: boolean = false;
  popularCountries: string[] = [];
  allCountries: string[] = [];
  deletePassword: string = '';
  deleteErrorMessage: string = '';
  deleteSuccessMessage: string = '';
  deleteFadeOut: boolean = false;
  showExtra: boolean = false;

  constructor(private userService: UserService, private countryService: CountryService, private router: Router) {}

  // ✅ Initialisiert die Komponente und lädt Benutzerdaten
  ngOnInit(): void {
    this.loadUserData();
    this.popularCountries = this.countryService.getPopularCountries();
    this.allCountries = this.countryService.getAllCountries();
  
    // Zeige die Login-Meldung an (aus localStorage)
    this.loginMessage = localStorage.getItem('loginMessage');
    if (this.loginMessage) {
      // Nach 2 Sekunden soll die Meldung anfangen zu verblassen
      setTimeout(() => {
        this.fadeOut = true;
      }, 2000);
      // Nach insgesamt 3 Sekunden wird die Meldung komplett entfernt
      setTimeout(() => {
        this.loginMessage = '';
        this.fadeOut = false;
        localStorage.removeItem('loginMessage');
      }, 3000);
    }
  }
  

  // ✅ Lädt die aktuellen Benutzerdaten aus dem Backend  
    loadUserData(): void {
      this.userService.getMyData().subscribe({
        next: (data) => {
          this.userData = data;
          this.updatedUserData = { ...data };
        },
        error: (err) => {
          this.errorMessage = "Fehler beim Laden der Benutzerdaten.";
          console.error("Fehler beim Laden der Benutzerdaten:", err);
        }
      });
    } 


  // ✅ Öffnet das Modal zur Bearbeitung der Benutzerdaten
  openModal(): void {
    
    const modalElement = document.getElementById('userModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  // ✅ Schließt das Modal
  closeModal(): void {
    const modalElement = document.getElementById('userModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

  // ✅ Speichert die Änderungen am Benutzerprofil
  onSaveChanges(): void {
    if (this.updatedUserData.password && this.updatedUserData.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }
  
    this.passwordMismatch = false; // Rücksetzen, falls alles passt
  
    console.log("🚀 Sende folgende Daten an die API:", this.updatedUserData);
  
    this.userService.updateUserData(this.updatedUserData).subscribe({
      next: () => {
        this.successMessage = 'Änderungen gespeichert!';
        // Nach 2 Sekunden soll die Meldung anfangen zu verblassen
        setTimeout(() => {
          this.fadeOut = true;
        }, 2000);
        // Nach 3 Sekunden wird die Meldung komplett entfernt und das Fade zurückgesetzt
        setTimeout(() => {
          this.successMessage = '';
          this.fadeOut = false;
        }, 3000);
  
        this.loadUserData();
        this.closeModal();
      },
      error: (err) => {
        this.errorMessage = 'Fehler beim Speichern der Änderungen.';
        console.error('❌ API Fehler:', err);
      },
    });
  }


  getUserAge(birthDate: string | null | undefined): string {
    if (!birthDate) return "Nicht bekannt";
  
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return "Ungültiges Datum";
  
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
  
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--; // Falls der Geburtstag noch nicht war, ein Jahr abziehen
    }
  
    return `${age} Jahre`;
  }
  
  getGenderTranslation(gender: string | null | undefined): string {
    if (!gender) return "Nicht angegeben";
    
    const genderMap: Record<string, string> = {
      "male": "Männlich",
      "female": "Weiblich",
      "other": "Divers"
    };
  
    return genderMap[gender] || "Unbekannt";
  }

  getPasswordStrength(password: string): string {
    if (!password || password.length < 8) return "❌ Ungültig (mind. 8 Zeichen)";
  
    let strengthPoints = 0;
    if (password.match(/[A-Z]/)) strengthPoints++; // Großbuchstaben
    if (password.match(/[a-z]/)) strengthPoints++; // Kleinbuchstaben
    if (password.match(/[0-9]/)) strengthPoints++; // Zahl
    if (password.match(/[\W_]/)) strengthPoints++; // Sonderzeichen
  
    switch (strengthPoints) {
      case 0:
      case 1:
        return "⚠️ Schwach";
      case 2:
        return "🟡 Mittel";
      case 3:
        return "🟢 Stark";
      case 4:
        return "🟢💪 Sehr stark!";
      default:
        return "❌ Ungültig";
    }
  }



   // ================================
  // Account-Löschung mit Passwort-Eingabe
  // ================================

// Methode, um das Account-Lösch-Modal zu öffnen
openDeleteModal(): void {
  const modalElement = document.getElementById('deleteAccountModal');
  if (modalElement) {
    const deleteModal = new bootstrap.Modal(modalElement);
    deleteModal.show();
  }
}


  // Diese Methode ruft den Service auf, um den Account zu löschen
  deleteAccount(): void {
    if (!this.deletePassword) {
      this.errorMessage = "Bitte gib dein Passwort zur Bestätigung ein.";
      return;
    }
    
    this.deleteErrorMessage = '';

    this.userService.deleteAccount(this.deletePassword).subscribe({
      next: () => {
        this.deleteSuccessMessage = "Dein Account wurde erfolgreich gelöscht.";
        setTimeout(() => {
          this.deleteFadeOut = true;
        }, 2000);
        setTimeout(() => {
          this.deleteSuccessMessage = '';
          this.deleteFadeOut = false;
          // Schließe das Modal
          const modalElement = document.getElementById('deleteAccountModal');
          if (modalElement) {
            const deleteModal = bootstrap.Modal.getInstance(modalElement);
            if (deleteModal) {
              deleteModal.hide();
            }
          }
          localStorage.removeItem('token');
          this.router.navigate(['/home']);
        }, 3000);
      },
      error: (err) => {
        this.deleteErrorMessage = "Beim Löschen deines Accounts ist ein Fehler aufgetreten. Bitte überprüfe dein Passwort.";
        console.error(err);
      }
    });
  }
}
