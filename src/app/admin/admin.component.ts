import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { User } from '../models/user.model';
import { UserUpdateModel } from '../models/user-update.model';

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

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();

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
    this.selectedUser = { ...user } as User;
    const modalElement = document.getElementById('adminUserModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  // ✅ Speichert Änderungen an den Benutzerdaten
  onSaveChanges(): void {
    this.adminService.updateUserData(this.selectedUser).subscribe({
      next: () => {
        this.successMessage = 'Änderungen erfolgreich gespeichert!';
        setTimeout(() => this.successMessage = '', 3000); // ✅ Erfolgsmeldung nach 3 Sek. ausblenden
        this.loadUsers();
        this.closeModal();
      },
      error: (err) => {
        this.errorMessage = 'Fehler beim Speichern der Änderungen.';
        console.error('Fehler:', err);
        setTimeout(() => this.errorMessage = '', 3000); // ❌ Fehlermeldung nach 3 Sek. ausblenden
      }
    });
  }

  // ✅ Schließt das Modal
  closeModal(): void {
    const modalElement = document.getElementById('adminUserModal'); 
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

  // ✅ Löscht den ausgewählten Benutzer nach Bestätigung
  deleteUser(): void {
    if (confirm('Möchtest du diesen Benutzer wirklich löschen?')) {
      this.adminService.deleteUser(this.selectedUser.id).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => {
          console.error('Fehler beim Löschen des Benutzers:', err);
        }
      });
    }
  }
}
