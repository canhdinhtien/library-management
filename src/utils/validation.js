export const validateRegistrationData = (data) => {
  const errors = {};
  const {
    firstName,
    surname,
    email,
    username,
    password,
    verifyPassword,
    phone,
    dob,
  } = data || {};

  if (!firstName?.trim()) errors.firstName = "First name is required";
  if (!surname?.trim()) errors.surname = "Surname is required";

  if (!email?.trim()) {
    errors.email = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!username?.trim()) {
    errors.username = "Username is required";
  } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    errors.username =
      "Username must be 3-20 characters and contain only letters, numbers, or underscores (_)";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!verifyPassword) {
    errors.verifyPassword = "Password verification is required";
  } else if (password && password !== verifyPassword) {
    errors.verifyPassword = "Passwords do not match";
  }

  if (phone && phone.trim() && !/^\+?[\d\s-()]{7,20}$/.test(phone)) {
    errors.phone = "Please enter a valid phone number format";
  }

  if (dob && dob.trim()) {
    if (isNaN(new Date(dob).getTime())) {
      errors.dob = "Please enter a valid date";
    }
  }
  return errors;
};
