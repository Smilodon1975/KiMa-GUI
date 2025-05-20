import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'KiMa_Gui';
 
  private auth = inject(AuthService);

  ngOnInit(): void {   
    this.auth.checkToken();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }  
}



