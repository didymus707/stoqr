export const passwordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

  export const passwordRequirementMessage =
    "Weak Password. \nYour password must have 8+ characters, uppercase, lowercase, number, and special character";