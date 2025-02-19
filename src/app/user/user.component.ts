import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UserComponent implements OnInit {
  userData: any = null;
  isEditing = false;
  updatedUserData: any = {};
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
        this.updatedUserData = { ...data }; // Kopie erstellen für das Bearbeiten
      },
      error: (err) => {
        this.errorMessage = "Fehler beim Laden der Benutzerdaten.";
        console.error("Fehler beim Laden der Benutzerdaten:", err);
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.updatedUserData = { ...this.userData }; // Änderungen verwerfen
    }
  }

  saveChanges(): void {
    this.userService.updateUserData(this.userData).subscribe({
      next: (response) => {
        if (response && response.message) {
          this.successMessage = response.message;
        } else {
          this.successMessage = "Änderungen gespeichert!";
        }
        this.errorMessage = '';
        this.isEditing = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "Fehler beim Speichern der Änderungen.";
        this.successMessage = '';
        console.error("Fehler beim Speichern der Daten:", err);
      }
    });
  }

}
