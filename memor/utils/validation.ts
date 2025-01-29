export const passwordValidation = {
  hasNumber: (password: string) => /\d/.test(password),
  hasLetter: (password: string) => /[a-zA-Z]/.test(password),
  isMinLength: (password: string) => password.length >= 8,

  getStrengthMessage: (password: string) => {
    if (!password) return "";

    const checks = {
      hasNumber: passwordValidation.hasNumber(password),
      hasLetter: passwordValidation.hasLetter(password),
      isMinLength: passwordValidation.isMinLength(password),
    };

    const messages: string[] = [];

    if (!checks.hasNumber) messages.push("Include at least one number");
    if (!checks.hasLetter) messages.push("Include at least one letter");
    if (!checks.isMinLength) messages.push("Use 8 characters or more");

    return messages.join(" • ");
  },

  isValid: (password: string) =>
    passwordValidation.hasNumber(password) &&
    passwordValidation.hasLetter(password) &&
    passwordValidation.isMinLength(password),
};
