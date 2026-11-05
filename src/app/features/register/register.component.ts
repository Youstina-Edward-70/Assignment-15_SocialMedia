import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  msgErr = signal<string>('');
  loading = signal<boolean>(false);
  eyeOpendPass = signal<boolean>(true);
  eyeOpendRePass = signal<boolean>(true);

  registerForm = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(3)]],
    username: [""],
    email: ["", [Validators.required, Validators.email]],
    dateOfBirth: ["", Validators.required],
    gender: ["", Validators.required],
    password: ["", [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]],
    rePassword: ["", Validators.required],
  }, { 'updateOn': 'submit', validators: this.confirmPassword })

  // registerForm = new FormGroup({
  //   name: new FormControl("", [Validators.required, Validators.minLength(3)]),
  //   username: new FormControl(""),
  //   email: new FormControl("", [Validators.required, Validators.email]),
  //   dateOfBirth: new FormControl("", Validators.required),
  //   gender: new FormControl("", Validators.required),
  //   password: new FormControl("", [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]),
  //   rePassword: new FormControl(""),
  // }, { 'updateOn': 'submit' });

  submit(): void {
    if (this.registerForm.valid) {
      this.loading.set(true);
      this.authService.signUp(this.registerForm.value).subscribe({
        next: (res) => {
          if (res.success) {
            // navigate to login
            this.router.navigate(['/login']);
          }
        },
        error: (err) => {
          this.msgErr.set(err.error.message);
          this.loading.set(false);
        },
        complete: () => this.loading.set(false),
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  confirmPassword(g: AbstractControl) {
    return g.get('password')?.value === g.get('rePassword')?.value
      ? null : { 'mismatch': true };
  }

  togglePassword(inp: HTMLInputElement): void {
    if (inp.getAttribute('type') === 'password') {
      inp.setAttribute('type', 'text');
      (inp.id === 'password') ? this.eyeOpendPass.set(false) : this.eyeOpendRePass.set(false);
    } else {
      inp.setAttribute('type', 'password');
      (inp.id === 'password') ? this.eyeOpendPass.set(true) : this.eyeOpendRePass.set(true);
    }
  }
}
