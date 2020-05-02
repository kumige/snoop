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

  static checkForSpaces(control: AbstractControl): ValidationErrors | null {
    if (control.value.indexOf(' ') >= 0) {
      return { hasSpaces: true };
    }
    return null;
  }
}
