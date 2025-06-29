import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { UserProfile } from '../../models/user-profile.model';
import { VehicleCategory } from '../../models/user-profile.model';
import { UserUpdateModel } from '../../models/user-update.model';
import * as bootstrap from 'bootstrap';
import { CountryService } from '../../services/country.service';
import { Router } from '@angular/router';
import { switchMap, catchError, tap, finalize } from 'rxjs/operators'; // RxJS Operatoren importieren
import { of, throwError} from 'rxjs'; // of und throwError importieren

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
  isLoading: boolean = false;
  

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
      

      // Lädt die aktuellen Benutzerdaten UND Profildaten
      loadUserData(): void {
        this.userService.getMyData().subscribe({
          next: (data: User) => { 
            console.log("Daten empfangen von API (getMyData):", data);
            // Typisieren als User
            this.userData = data;
            // Initialisiere updatedUserData mit User-Daten UND Profildaten
            this.updatedUserData = {
                // Kopiere Basis-User-Daten
                id: data.id,
                email: data.email,
                userName: data.userName,
                firstName: data.firstName,
                lastName: data.lastName,
                title: data.title,
                gender: data.gender,
                phonePrivate: data.phonePrivate,
                phoneMobile: data.phoneMobile,
                phoneWork: data.phoneWork,
                birthDate: data.birthDate,
                street: data.street,
                zip: data.zip,
                city: data.city,
                country: data.country,
                newsletterSub: data.newsletterSub,
                userProfile: data.userProfile ? { ...data.userProfile } : this.getDefaultProfile()
               
            };
            console.log("Geladene Daten für Bearbeitung:", this.updatedUserData);
          },
          error: (err) => {
            this.errorMessage = "Fehler beim Laden der Benutzerdaten.";
            console.error("Fehler beim Laden der Benutzerdaten:", err);
          }
        });
      }

      // Hilfsmethode, um ein leeres/default Profil zu erstellen
      getDefaultProfile(): UserProfile {
          return {
              vehicleCategory: 'None',
              vehicleDetails: '',
              occupation: '',
              educationLevel: '',
              region: '',
              age: undefined, // oder null, je nach Typ
              incomeLevel: '',
              isInterestedInTechnology: false,
              isInterestedInSports: false,
              isInterestedInEntertainment: false,
              isInterestedInTravel: false
          };
      }


      // ✅ Öffnet das Modal zur Bearbeitung der Benutzerdaten
      openModal(): void {
        // Stelle sicher, dass die Daten frisch geladen sind oder zumindest initialisiert wurden
        if (!this.updatedUserData || !this.updatedUserData.userProfile) {
            // Ggf. loadUserData() erneut aufrufen oder sicherstellen,
            // dass updatedUserData korrekt initialisiert wurde in loadUserData()
            console.warn("Bearbeitungsdaten nicht vollständig initialisiert.");
            // Fallback: Initialisieren
            this.updatedUserData = { ...this.userData, profile: this.userData?.userProfile ? {...this.userData.userProfile} : this.getDefaultProfile() } as UserUpdateModel;
        }

      const modalElement = document.getElementById('userModal');
      if (modalElement) {
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
      }
    }

      // ✅ Schließt das Modal
      closeModal(): void {
        // Reset state if needed
        this.passwordMismatch = false;
        this.confirmPassword = '';
        this.errorMessage = ''; // Reset error on close
      const modalElement = document.getElementById('userModal');
      if (modalElement) {
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
    }

      // ✅ Speichert die Änderungen am Benutzerprofil
      // ✅ Speichert die Änderungen (User UND Profil)
      onSaveChanges(): void {
        this.isLoading = true; // Ladeanzeige starten
        this.errorMessage = ''; // Alte Fehler zurücksetzen
        this.successMessage = '';

        // Passwort-Check
        if (this.updatedUserData.password && this.updatedUserData.password !== this.confirmPassword) {
          this.passwordMismatch = true;
          this.isLoading = false; // Ladeanzeige stoppen
          return;
        }
        this.passwordMismatch = false;

        // 1. Bereite die Daten für die zwei separaten Aufrufe vor
        const baseUserData = { // Objekt für PUT /api/user/update
            id: this.updatedUserData.id,
            email: this.updatedUserData.email,
            userName: this.updatedUserData.userName,
            firstName: this.updatedUserData.firstName,
            lastName: this.updatedUserData.lastName,
            title: this.updatedUserData.title,
            gender: this.updatedUserData.gender,
            phonePrivate: this.updatedUserData.phonePrivate,
            phoneMobile: this.updatedUserData.phoneMobile,
            phoneWork: this.updatedUserData.phoneWork,
            birthDate: this.updatedUserData.birthDate,
            street: this.updatedUserData.street,
            zip: this.updatedUserData.zip,
            city: this.updatedUserData.city,
            country: this.updatedUserData.country,
            newsletterSub: this.updatedUserData.newsletterSub,
            // Passwort nur mitsenden, wenn es gesetzt wurde
            ...(this.updatedUserData.password && { password: this.updatedUserData.password })
        };

        // Stelle sicher, dass profile nicht null/undefined ist
        const profileData = this.updatedUserData.userProfile || this.getDefaultProfile(); // Objekt für PUT /api/userprofile


        console.log("Sende Basis-User-Daten:", baseUserData);
        console.log("Sende Profil-Daten:", profileData);

    // 2. Führe die Aufrufe sequenziell aus (erst User, dann Profil)
        this.userService.updateUserData(baseUserData).pipe(
          // Wenn User-Update erfolgreich war, fahre mit Profil-Update fort
          switchMap(() => {
            // Nur Profil updaten, wenn es auch Profildaten gibt
            // (sollte durch Initialisierung immer der Fall sein, aber sicher ist sicher)
        
            if (profileData) {
                console.log("User-Update erfolgreich, starte Profil-Update...");
                return this.userService.updateUserProfileData(profileData);
            } else {
                console.log("User-Update erfolgreich, keine Profildaten zum Senden.");
                return of(null); // Gibt ein leeres Observable zurück, um die Kette fortzusetzen
            }
          }),
          // Fehlerbehandlung für *beide* Aufrufe
          catchError((err) => {
            console.error('❌ Fehler beim Speichern:', err);
            // Versuche, eine spezifischere Fehlermeldung aus der API-Antwort zu extrahieren
            this.errorMessage = err?.error?.message || err?.error?.title || 'Fehler beim Speichern der Änderungen.';
            return throwError(() => err); // Fehler weitergeben, um finalize zu erreichen
          }),
          // Wird immer ausgeführt, egal ob Erfolg oder Fehler
          finalize(() => {
            this.isLoading = false; // Ladeanzeige beenden
          })
        ).subscribe({
          next: () => {
            // Dieser Block wird nur erreicht, wenn *beide* Aufrufe erfolgreich waren
            console.log("Profil-Update erfolgreich (oder übersprungen).");
            this.successMessage = 'Änderungen erfolgreich gespeichert!';
            // Timer für Erfolgsmeldung
            setTimeout(() => this.fadeOut = true, 2000);
            setTimeout(() => {
                this.successMessage = '';
                this.fadeOut = false;
            }, 3000);

            this.loadUserData(); // Daten neu laden
            this.closeModal(); // Modal schließen
          },
          // Fehlerfall wird bereits im catchError behandelt, aber zur Sicherheit:
          error: () => {
            // Hier sollte man normalerweise nicht landen, wenn catchError verwendet wird,
            // aber zur Sicherheit Ladeanzeige beenden.
            this.isLoading = false;
          }
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
          this.closeModal();
        }, 2000);
        setTimeout(() => {
          this.deleteSuccessMessage = '';
          this.deleteFadeOut = false;
          // Schließe das Modal
          const modalElement = document.getElementById('deleteAccountModal');
          if (modalElement) {
            const deleteModal = bootstrap.Modal.getOrCreateInstance(modalElement);
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

      // METHODE zum sicheren Leeren eines Profilfeldes
      clearProfileField(fieldName: keyof UserProfile) {
        if (this.updatedUserData?.userProfile) { 
          if (fieldName === 'occupation' || fieldName === 'vehicleDetails' || fieldName === 'educationLevel' || fieldName === 'region') {
            this.updatedUserData.userProfile[fieldName] = undefined;
          } else if (fieldName === 'incomeLevel') {
            this.updatedUserData.userProfile[fieldName] = ''; 
          } else if (fieldName === 'age') {
            this.updatedUserData.userProfile[fieldName] = undefined; 
          }
        } else {
          console.warn('User profile object does not exist in updatedUserData.');
        }
      }

    
}
