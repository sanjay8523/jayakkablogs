import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <h2 style="text-align:center;">Login</h2>

    <form (submit)="login($event)" style="max-width:300px;margin:auto;">
      <input placeholder="Email" required />
      <button>Login</button>
    </form>
  `
})
export class LoginComponent {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  login(event: Event) {
    event.preventDefault();
    const email = (event.target as any)[0].value;
    this.auth.login(email);
    this.router.navigate(['/dashboard']);
  }
}
