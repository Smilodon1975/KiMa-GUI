import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { User } from '../models/user.model';
import { UserUpdateModel } from '../models/user-update.model';
import { CountryService } from '../services/country.service';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminComponent implements OnInit {
  users: UserUpdateModel[] = [];
  filteredUsers: UserUpdateModel[] = [];
  selectedUser: UserUpdateModel = {} as UserUpdateModel;
  searchText: string = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages: number[] = [];
  private userModal: any;
  successMessage = '';
  errorMessage = '';
  loginMessage: string | null = '';
  isEditMode = false;
  confirmPassword: string = '';
  passwordMismatch: boolean = false;
  popularCountries: string[] = [];
  allCountries: string[] = [];

  constructor(private adminService: AdminService, private countryService: CountryService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.popularCountries = this.countryService.getPopularCountries();
    this.allCountries = this.countryService.getAllCountries();

    // ✅ Login-Meldung aus localStorage abrufen und nach 3 Sek. ausblenden
    this.loginMessage = localStorage.getItem('loginMessage');
    if (this.loginMessage) {
      setTimeout(() => {
        this.loginMessage = '';
        localStorage.removeItem('loginMessage');
      }, 3000);
    }
  }

  // ✅ Lädt die Benutzerliste aus dem AdminService
  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = [...this.users];
        this.updatePagination();
      },
      error: (err) => {
        console.error("Fehler beim Laden der Benutzer:", err);
      }
    });
  }

  // ✅ Berechnet die Seitenzahlen für die Paginierung
  calculatePagination(): void {
    const pageCount = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    this.totalPages = Array(pageCount).fill(0).map((_, i) => i + 1);
  }

  updatePagination(): void {
    this.totalPages = Array(Math.ceil(this.users.length / this.itemsPerPage)).fill(0).map((_, i) => i + 1);
  }

  // ✅ Filtert die Benutzer basierend auf dem Suchtext
  filterUsers(): void {
    this.filteredUsers = this.users.filter(user =>
      user.email?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      user.userName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(this.searchText.toLowerCase())
    );
    this.calculatePagination();
  }

  // ✅ Wechselt die angezeigte Seite in der Paginierung
  changePage(page: number): void {
    this.currentPage = page;
  }

  // ✅ Öffnet das Modal zur Bearbeitung eines Benutzers
  openModal(user: UserUpdateModel): void {
    this.selectedUser = { ...user };
    this.isEditMode = false; // Erstmal nur Ansicht anzeigen
    const modalElement = document.getElementById('adminUserModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }
  
  enableEditMode(): void {
    this.isEditMode = true;
  }
  
  disableEditMode(): void {
    this.isEditMode = false;
  }

  // ✅ Speichert Änderungen an den Benutzerdaten
  onSaveChanges(): void {
    // ✅ Falls ein Passwort eingegeben wurde, prüfen, ob beide Felder übereinstimmen
    if (this.selectedUser.password && this.selectedUser.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }
  
    this.passwordMismatch = false; // Falls erfolgreich, zurücksetzen
  
    this.adminService.updateUserData(this.selectedUser).subscribe({
      next: () => {
        this.successMessage = 'Änderungen gespeichert!';
        setTimeout(() => this.successMessage = '', 3000);
        this.loadUsers();
        this.closeModal();
      },
      error: (err) => {
        this.errorMessage = 'Fehler beim Speichern der Änderungen.';
        console.error('Fehler:', err);
        setTimeout(() => this.errorMessage = '', 3000);
      },
    });
  }
  

  // ✅ Schließt das Modal
  closeModal(): void {
    const modalElement = document.getElementById('adminUserModal'); 
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      console.log("🚀 Versuche, das Modal zu schließen...");
      modalInstance.hide();
    } else {
      console.warn("⚠️ Modal-Element nicht gefunden!");
    }
  }
  
  

  // ✅ Löscht den ausgewählten Benutzer nach Bestätigung
  // ✅ Löscht den Benutzer & aktualisiert die Liste sofort
deleteUser(): void {
  if (confirm('Möchtest du diesen Benutzer wirklich löschen?')) {
    this.adminService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        // 🔹 Benutzer aus der Liste entfernen, ohne die ganze Seite zu laden
        this.users = this.users.filter(user => user.id !== this.selectedUser.id);
        this.filteredUsers = this.filteredUsers.filter(user => user.id !== this.selectedUser.id);
        this.updatePagination(); // 🔹 Paginierung aktualisieren
        
        // 🔹 Modal schließen
        this.closeModal();

        // 🔹 Erfolgsmeldung anzeigen
        this.successMessage = 'Benutzer erfolgreich gelöscht!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('Fehler beim Löschen des Benutzers:', err);
        this.errorMessage = 'Fehler beim Löschen des Benutzers!';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
}

getUserAge(birthDate: string | null | undefined): string {
  if (!birthDate) {
    return "Nicht bekannt"; // Falls kein Geburtsdatum eingetragen ist
  }

  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) {
    return "Ungültiges Datum"; // Falls das Geburtsdatum fehlerhaft ist
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--; // Falls der Geburtstag dieses Jahr noch nicht war, ein Jahr abziehen
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


}
