const validation = (Username, Displayname, Email, Password) => {
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
  } else if (Email.length > 30) {
    return {
      valid: false,
      message: "Email can not be longer than 30 characters",
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
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w)+$/.test(email)) {
    return true;
  }
};

const hasSpace = (text) => {
  if (text.indexOf(" ") >= 0) {
    return true;
  }
};

module.exports = { validation };
