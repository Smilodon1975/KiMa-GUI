import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {jwtDecode} from 'jwt-decode';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [FormsModule]
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        alert('Login erfolgreich!');
  
        this.authService.getUserRole().subscribe(role => {
          console.log("Ermittelte Rolle:", role);
          if (role === 'Admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/user']);
          }
        });
      },
      error: (err) => {
        alert('Login fehlgeschlagen! Überprüfe deine Eingaben.');
      }
    });
  }
  
}
