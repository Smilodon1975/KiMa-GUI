import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {jwtDecode} from 'jwt-decode';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  loginData = {email: '', password: ''};
  loginMessage: string = '';
  isSuccess: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('loginMessage', 'Login erfolgreich!');
  
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
        this.loginMessage = 'Login fehlgeschlagen! Bitte überprüfe deine Eingaben.';
        this.isSuccess = false;
        setTimeout(() => this.loginMessage = '', 3000);
      }
    });
  }
  
  
}
