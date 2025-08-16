import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { User } from '../../models/user.model';
import { UserUpdateModel } from '../../models/user-update.model';
import { CountryService } from '../../services/country.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ModalMoveResizeDirective } from '../../shared/modal-move-resize.directive';


@Component({
  selector: 'app-admin',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalMoveResizeDirective],
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
  readonly maxPageButtons = 7;

    get paginationRange(): number[] {
    const total = this.totalPages.length;
    // wenn insgesamt weniger Seiten als maxPageButtons, zeige alle
    if (total <= this.maxPageButtons) {
      return this.totalPages;
    }
    const half = Math.floor(this.maxPageButtons / 2);
    let start = this.currentPage - half;
    let end   = this.currentPage + half;

    // fange unter- und oberhalb ab
    if (start < 1) {
      start = 1;
      end = this.maxPageButtons;
    }
    if (end > total) {
      end = total;
      start = total - this.maxPageButtons + 1;
    }
    return Array(end - start + 1)
      .fill(0)
      .map((_, i) => start + i);
  }

  constructor(private adminService: AdminService, private countryService: CountryService, private router: Router) {}

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
            this.users = data.map(user => ({
              ...user,
              userProfile: user.userProfile ?? {} // Ensure userProfile is always an object
            })) as UserUpdateModel[];
            this.filteredUsers = [...this.users];
            this.calculatePagination();
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

      // ✅ Wechselt die angezeigte Seite in der Paginierung
      changePage(page: number): void {
        this.currentPage = page;
      }


      // ✅ Filtert die Benutzer basierend auf dem Suchtext
      filterUsers(): void {
        this.filteredUsers = this.users.filter(user =>
          user.email?.toLowerCase().includes(this.searchText.toLowerCase()) ||
          user.userName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
          user.firstName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(this.searchText.toLowerCase())
        );
        this.currentPage = 1; 
        this.calculatePagination();
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
        if (this.selectedUser.password && this.selectedUser.password !== this.confirmPassword) {
          this.passwordMismatch = true;
          return;
        }      
        this.passwordMismatch = false; 
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

        makeAdmin(user: User) {
        if (!confirm(`“${user.email}” wirklich zum Admin machen?`)) return;
        this.adminService.setUserRole(user.id, 'Admin').subscribe({
          next: () => {
            user.role = 'Admin';
            this.successMessage = `“${user.email}” ist jetzt Admin.`;
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: () => this.showError()
        });
      }

      demoteToProband(user: User) {
        if (!confirm(`“${user.email}” wirklich zum Probanden zurückstufen?`)) return;
        this.adminService.setUserRole(user.id, 'Proband').subscribe({
          next: () => {
            user.role = 'Proband';
            this.successMessage = `“${user.email}” ist jetzt wieder Proband.`;
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: () => this.showError()
        });
      }

      private showError() {
        this.errorMessage = 'Fehler beim Ändern der Rolle.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    

      get displayedUsers(): UserUpdateModel[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredUsers.slice(start, start + this.itemsPerPage);
      }



}
