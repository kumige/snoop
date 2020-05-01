import { AbstractControl, ValidationErrors } from '@angular/forms';

export class checkCharacters {
  static illegalCharacters(control: AbstractControl): ValidationErrors | null {
    var specialCharacters = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (specialCharacters.test(control.value)) {
      return { illegalCharacters: true };
    }
    return null;
  }
}
