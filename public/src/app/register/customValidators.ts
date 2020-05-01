import {
  AbstractControl,
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
} from '@angular/forms';

export class customValidator {
  static illegalCharacters(control: AbstractControl): ValidationErrors | null {
    var specialCharacters = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (specialCharacters.test(control.value)) {
      return { illegalCharacters: true };
    }
    return null;
  }
}
