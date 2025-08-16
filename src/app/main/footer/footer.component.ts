import { Component } from '@angular/core';
import { version } from '../../../environments/version';
import { RouterModule } from '@angular/router';
import { ModalMoveResizeDirective } from '../../shared/modal-move-resize.directive';


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule, ModalMoveResizeDirective],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  version = version;

}
