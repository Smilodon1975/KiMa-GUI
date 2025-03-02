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
  userData: User | null = null;
  updatedUserData: UserUpdateModel = {} as UserUpdateModel; 
  successMessage = '';
  errorMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUserData();
  }

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

  openModal(): void {
    const modalElement = document.getElementById('userModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  closeModal(): void {
    const modalElement = document.getElementById('userModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

  onSaveChanges(): void {
    this.userService.updateUserData(this.updatedUserData).subscribe({
      next: () => {
        this.successMessage = 'Änderungen gespeichert!';
        this.loadUserData(); // 🔹 Benutzerinfo neu laden
        this.closeModal();
      },
      error: (err) => {
        this.errorMessage = 'Fehler beim Speichern der Änderungen.';
        console.error('Fehler:', err);
      },
    });
  }
}
