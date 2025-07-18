import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './shared/components/navigation/navigation.component';
import { NotificationCenterComponent } from './shared/components/notification-center/notification-center.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationComponent, NotificationCenterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = "Plateforme d'Apurement CEMAC";
}
