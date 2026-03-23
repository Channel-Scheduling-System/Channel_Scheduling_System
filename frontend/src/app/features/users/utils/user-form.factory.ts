// features/users/utils/user-form.factory.ts
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { registerFieldValidator, passwordMatchValidator } from '../../auth/validators/register.validators';

export type RegisterFormType = {
  alias: FormControl<string | null>;
  firstName: FormControl<string | null>;
  lastName: FormControl<string | null>;
  phone: FormControl<string | null>;
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  confirmPassword: FormControl<string | null>;
  adminCode?: FormControl<string | null>;
};

export class UserFormFactory {
  static createRegisterForm(fb: FormBuilder, role: 'CLIENT' | 'ADMIN' | 'WORKER'): FormGroup {
    const form = fb.group<RegisterFormType>({
      alias: fb.control('', [Validators.required, registerFieldValidator('alias')]),
      firstName: fb.control('', [Validators.required, registerFieldValidator('firstName')]),
      lastName: fb.control('', [Validators.required, registerFieldValidator('lastName')]),
      phone: fb.control('', [Validators.required, registerFieldValidator('phone')]),
      email: fb.control('', [Validators.required, Validators.email, registerFieldValidator('email')]),
      password: fb.control('', [Validators.required, registerFieldValidator('password')]),
      confirmPassword: fb.control('', [Validators.required])
    }, {
      validators: passwordMatchValidator('password', 'confirmPassword')
    });
    /*
    if (role === 'ADMIN') {
      form.addControl('adminCode', fb.control('', [Validators.required, Validators.minLength(6)]));
    }
    */
    return form;
  }

  static getPasswordChecks(password: string) {
    return {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
  }
}