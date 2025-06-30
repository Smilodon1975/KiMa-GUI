import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [FormsModule, CommonModule, RouterModule]
})
export class LoginComponent {
  loginData = { email: '', password: '' };
  loginMessage: string = '';
  isSuccess: boolean = false;
  isLoading: boolean = false;

  constructor(private authService: AuthService, public router: Router) {}

  // ✅ Login-Formular absenden und Authentifizierung durchführen
  onSubmit() {
     this.loginMessage = '';
      this.isSuccess = false;    
      this.isLoading = true;
      
      this.authService.login(this.loginData)
          .pipe( finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
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
