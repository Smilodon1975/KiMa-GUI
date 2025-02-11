import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  users: any[] = [];

  constructor(private authService: AuthService, private http: HttpClient) {}

  getUsers() {
    this.http.get<any[]>('http://localhost:5274/api/admin/users').subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error("Fehler beim Abrufen der Benutzer", err)
    });
  }

  deleteUser(userId: number) {
    this.http.delete(`http://localhost:5274/api/admin/delete-user/${userId}`).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== userId);
      },
      error: (err) => console.error("Fehler beim Löschen des Benutzers", err)
    });
  }
}

