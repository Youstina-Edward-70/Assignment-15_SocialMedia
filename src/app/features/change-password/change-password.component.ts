import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/services/auth.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  isLoading = signal<boolean>(false);
  msgErr = signal<string>('');
  eyeOpendCurrentPass = signal(false);
  eyeOpendNewPass = signal(false);
  eyeOpendConfirmPass = signal(false);

  changePasswordForm: FormGroup = this.fb.group({
    password: ["", [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]],
    newPassword: ["", [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]],
    confirmNewPassword: ["", Validators.required],
  }, { 'updateOn': 'submit', validators: this.confirmPass });

  confirmPass(g: AbstractControl) {
    return g.get('newPassword')?.value === g.get('confirmNewPassword')?.value
      ? null : { 'mismatch': true };
  }

  submit(): void {
    if (this.changePasswordForm.valid) {
      const formValues = this.changePasswordForm.value;
      const payload = {
        password: formValues.password,
        newPassword: formValues.newPassword
      };

      this.isLoading.set(true);
      this.authService.changePassword(payload).subscribe({
        next: (res) => {
          console.log(res);
          // save token
          localStorage.setItem('token', res.data.token);
          // navigate to feed
          this.router.navigate(['/feed']);
        },
        error: (err) => {
          console.log(err);
          this.msgErr.set(err.error.message);
          this.isLoading.set(false);
        },
        complete: () => this.isLoading.set(false),
      });
    } else {
      this.changePasswordForm.markAllAsTouched();
    }
  }

  togglePassword(input: HTMLInputElement) {
    if (input.type === 'password') {
      input.type = 'text';
    } else {
      input.type = 'password';
    }

    if (input.id === 'current-password') {
      this.eyeOpendCurrentPass.update(val => !val);
    } else if (input.id === 'new-password') {
      this.eyeOpendNewPass.update(val => !val);
    } else if (input.id === 'confirm-new-password') {
      this.eyeOpendConfirmPass.update(val => !val);
    }
  }
}
