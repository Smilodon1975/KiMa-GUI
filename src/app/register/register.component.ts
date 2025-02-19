import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  imports: [FormsModule]
})
export class RegisterComponent { 
  email = '';
  password = ''; 
  firstName = '';  
  lastName = '';  

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    this.authService.register( this.email, this.password, this.firstName, this.lastName).subscribe({
      next: (response) => {
        alert(response.message); // Jetzt wird die JSON-Nachricht ausgelesen
        this.router.navigate(['/login']);
      },
      error: (err) => {
        let errorMessage = "Registrierung fehlgeschlagen.";
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (typeof err.error === 'object') {
          errorMessage = JSON.stringify(err.error); // Falls das Backend ein Object sendet
        }
        alert(errorMessage);
      }
    });
    
  }
}