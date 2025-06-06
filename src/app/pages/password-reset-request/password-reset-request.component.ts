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

  constructor(private authService: AuthService) {}

  // ✅ Sendet eine Anfrage zum Zurücksetzen des Passworts
  requestPasswordReset() {
    this.authService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.successMessage = 'Falls diese E-Mail existiert, wurde eine Passwort-Reset-E-Mail gesendet.';
      },
      error: () => {
        this.successMessage = 'Fehler beim Anfordern des Passwort-Resets!';
      }
    });
  }
}
