import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/services/auth.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  msgErr = signal<string>('');
  loading = signal<boolean>(false);
  eyeOpend = signal<boolean>(true);

  loginForm = this.fb.group({
    login: ["", Validators.required],
    password: ["", Validators.required],
  }, { 'updateOn': 'submit' })

  // loginForm = new FormGroup({
  //   login: new FormControl("", Validators.required),
  //   password: new FormControl("", Validators.required),
  // }, { 'updateOn': 'submit' });

  submit(): void {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.authService.signIn(this.loginForm.value).subscribe({
        next: (res) => {
          if (res.success) {
            // save current user data & token
            this.authService.currentUser.set(res.data.user);
            localStorage.setItem('token', res.data.token);
            // navigate to feed
            this.router.navigate(['/feed']);
          }
        },
        error: (err) => {
          this.msgErr.set(err.error.message);
          this.loading.set(false);
        },
        complete: () => this.loading.set(false),
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  togglePassword(inp: HTMLInputElement): void {
    if (inp.getAttribute('type') === 'password') {
      inp.setAttribute('type', 'text');
      this.eyeOpend.set(false);
    } else {
      inp.setAttribute('type', 'password');
      this.eyeOpend.set(true);
    }
  }
}
