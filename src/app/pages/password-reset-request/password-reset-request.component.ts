import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-reset-request',
  templateUrl: './password-reset-request.component.html',
  styleUrls: ['./password-reset-request.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [AuthService]
})
export class PasswordResetRequestComponent {
  email: string = ''; 
  successMessage: string = '';
  alertType: 'success' | 'danger' = 'success';
  loading = false;


  constructor(private authService: AuthService) {}

  // ✅ Sendet eine Anfrage zum Zurücksetzen des Passworts
  requestPasswordReset() {
    this.loading = true;
    this.successMessage = '';
    this.authService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.successMessage = 'Wenn diese E-Mail in unserer Datenbank vermerkt ist, wurde eine Passwort-Reset-E-Mail gesendet.';
        this.alertType = 'success';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 6000);
      },
      error: () => {
        this.successMessage = 'Fehler beim Anfordern des Passwort-Resets!';
        this.alertType = 'danger';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 6000);
      }
    });
  }

 

}
