import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../models/user.model';
import { UserUpdateModel } from '../models/user-update.model';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UserComponent implements OnInit {
  userData: User | null = null;
  isEditing = false;
  updatedUserData: any = {};
  successMessage = '';
  errorMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    if (!this.userData) { // 🛑 Verhindert wiederholte API-Calls
      this.loadUserData();
    }
  }

  loadUserData(): void {
    this.userService.getMyData().subscribe({
      next: (data) => {
        this.userData = data;
        this.updatedUserData = { ...data }; // Kopie für Bearbeitung
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

  onSaveChanges() {
    if (!this.updatedUserData) {
      alert('Keine Daten zum Speichern vorhanden.');
      return;
    }
  
    const updatedUser: UserUpdateModel = {
      id: this.updatedUserData.id, // 🔹 User-ID muss immer gesendet werden
      userName: this.updatedUserData.userName,
      email: this.updatedUserData.email,
      firstName: this.updatedUserData.firstName,
      lastName: this.updatedUserData.lastName,
      title: this.updatedUserData.title,
      gender: this.updatedUserData.gender,
      status: this.updatedUserData.status,
      phonePrivate: this.updatedUserData.phonePrivate,
      phoneMobile: this.updatedUserData.phoneMobile,
      phoneWork: this.updatedUserData.phoneWork,
      age: this.updatedUserData.age,
      birthDate: this.updatedUserData.birthDate,
      street: this.updatedUserData.street,
      zip: this.updatedUserData.zip,
      city: this.updatedUserData.city,
      country: this.updatedUserData.country,
    };
  
    this.userService.updateUserData(updatedUser).subscribe({
      next: () => {
        this.successMessage = 'Änderungen gespeichert!';
        this.isEditing = false;
        this.loadUserData(); // 🔹 Benutzerinfo neu laden
      },
      error: (err) => {
        this.errorMessage = 'Fehler beim Speichern der Änderungen.';
        console.error('Fehler:', err);
      }
    });
  }
  
  
}
