const validation = (Username, Displayname, Email, Password) => {
  if (Username.length < 5) {
    return {
      valid: false,
      message: "Username has to be atleast 5 characters long",
    };
  } else if (specialVariableCheck(Username)) {
    return {
      valid: false,
      message: "Username can not include illegal characters",
    };
  } else if (Displayname.length < 3) {
    return {
      valid: false,
      message: "Displayname has to be atleast 3 characters long",
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
  } else if (Password.length < 6) {
    return {
      valid: false,
      message: "Password has to be atleast 6 characters long",
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
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true;
  }
};

module.exports = { validation };
