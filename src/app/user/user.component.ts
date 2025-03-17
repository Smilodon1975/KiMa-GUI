import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../models/user.model';
import { UserUpdateModel } from '../models/user-update.model';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UserComponent implements OnInit {
  loginMessage: string | null = '';
  userData: User | null = null;
  updatedUserData: UserUpdateModel = {} as UserUpdateModel; 
  successMessage = '';
  errorMessage = '';
  confirmPassword: string = '';
  passwordMismatch: boolean = false;

  constructor(private userService: UserService) {}

  // ✅ Initialisiert die Komponente und lädt Benutzerdaten
  ngOnInit(): void {
    this.loadUserData();

    // ✅ Zeigt die Login-Meldung an und blendet sie nach 3 Sekunden aus
    this.loginMessage = localStorage.getItem('loginMessage');
    if (this.loginMessage) {
      setTimeout(() => {
        this.loginMessage = '';
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
  
    this.passwordMismatch = false; // Zurücksetzen, falls erfolgreich
  
    console.log("🚀 Sende folgende Daten an die API:", this.updatedUserData);
  
    this.userService.updateUserData(this.updatedUserData).subscribe({
      next: () => {
        this.successMessage = 'Änderungen gespeichert!';
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
  
  
}
