import { Component,OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.css'
})
export class ConfirmEmailComponent implements OnInit {
  confirmationMessage = '';

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const email = params['email'];
      let token = params['token'];
      console.log("Original token from URL:", token);
      // Decodiere den Token, falls nötig
      token = decodeURIComponent(token);
      console.log("Decoded token:", token);
      if (email && token) {
        this.authService.confirmEmail(email, token).subscribe({
          next: (res) => {
            this.confirmationMessage = 'E-Mail erfolgreich bestätigt!';
          },
          error: (err) => {
            this.confirmationMessage = 'E-Mail-Bestätigung fehlgeschlagen. Bitte versuche es erneut.';
          }
        });
      }
    });
  }
  
}
