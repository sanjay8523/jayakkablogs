import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <h2 style="text-align:center;">Dashboard</h2>
    <p style="text-align:center;">
      Logged in as: {{ auth.isLoggedIn() ? 'User' : 'Guest' }}
    </p>
  `
})
export class DashboardComponent {
  constructor(public auth: AuthService) {}
}
