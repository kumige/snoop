const registerValidation = (Username, Displayname, Email, Password) => {
  if (Username.length < 5) {
    return {
      valid: false,
      message: "Username has to be atleast 5 characters long",
    };
  } else if (Username.length > 20) {
    return {
      valid: false,
      message: "Username can not be longer than 20 characters",
    };
  } else if (hasSpace(Username)) {
    return {
      valid: false,
      message: "Username can not include spaces",
    };
  } else if (specialVariableCheck(Username)) {
    return {
      valid: false,
      message: "Username can not include illegal characters",
    };
  } else if (Displayname.length < 3) {
    return {
      valid: false,
      message: "Display name has to be atleast 3 characters long",
    };
  } else if (Displayname.length > 20) {
    return {
      valid: false,
      message: "Display name can not be longer than 20 characters",
    };
  } else if (hasSpace(Displayname)) {
    return {
      valid: false,
      message: "Display name can not include spaces",
    };
  } else if (specialVariableCheck(Displayname)) {
    return {
      valid: false,
      message: "Displayname can not include illegal characters",
    };
  } else if (!validEmail(Email)) {
    return {
      valid: false,
      message: "Invalid email",
    };
  } else if (Email.length > 80) {
    return {
      valid: false,
      message: "Email can not be longer than 80 characters",
    };
  } else if (hasSpace(Email)) {
    return {
      valid: false,
      message: "Email can not include spaces",
    };
  } else if (Password.length < 6) {
    return {
      valid: false,
      message: "Password has to be atleast 6 characters long",
    };
  } else if (Password.length > 20) {
    return {
      valid: false,
      message: "Password can not be longer than 20 characters",
    };
  } else {
    return { valid: true };
  }
};

const specialVariableCheck = (text) => {
  var specialCharacters = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  if (specialCharacters.test(text)) {
    return true;
  }
};

const validEmail = (email) => {
  if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,3}))$/.test(email)) {
    return true;
  }
};

const hasSpace = (text) => {
  if (text.indexOf(" ") >= 0) {
    return true;
  }
};

const specialVariableCheckBio = (text) => {
  var specialCharacters = /[<>]/;
  if (specialCharacters.test(text)) {
    return true;
  }
};

const displayNameValidation = (displayName) => {
  if (displayName.length < 3) {
    return {
      valid: false,
      message: "Display name has to be atleast 3 characters long",
    };
  } else if (displayName.length > 20) {
    return {
      valid: false,
      message: "Display name can not be longer than 20 characters",
    };
  } else if (hasSpace(displayName)) {
    return {
      valid: false,
      message: "Display name can not include spaces",
    };
  } else if (specialVariableCheck(displayName)) {
    return {
      valid: false,
      message: "Displayname can not include illegal characters",
    };
  } else {
    return { valid: true };
  }
};

const bioValidation = (bio) => {
  if (bio.length < 3) {
    return {
      valid: false,
      message: "Bio has to be atleast 3 characters long",
    };
  } else if (bio.length > 250) {
    return {
      valid: false,
      message: "Bio can not be longer than 250 characters",
    };
  } else if (specialVariableCheckBio(bio)) {
    return {
      valid: false,
      message: "Bio can not include illegal characters (< and >)",
    };
  } else {
    return { valid: true };
  }
};

const passwordValidation = (password) => {
  if (password.length < 6) {
    return {
      valid: false,
      message: "Password has to be atleast 6 characters long",
    };
  } else if (password.length > 20) {
    return {
      valid: false,
      message: "Password can not be longer than 20 characters",
    };
  } else {
    return { valid: true };
  }
};

module.exports = {
  registerValidation,
  displayNameValidation,
  bioValidation,
  passwordValidation,
};
