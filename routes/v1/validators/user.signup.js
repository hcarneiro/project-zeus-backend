module.exports = {
  firstName: {
    notEmpty: {
      errorMessage: 'First name is required'
    }
  },
  lastName: {
    notEmpty: {
      errorMessage: 'Last name is required'
    }
  },
  organizationName: {
    notEmpty: {
      errorMessage: 'Company name is required'
    }
  },
  email: {
    isEmail: {
      errorMessage: 'Email address is invalid'
    }
  },
  password: {
    notEmpty: {
      errorMessage: 'Password is required'
    },
    isLength: {
      options: [{ min: 8, max: 64 }],
      errorMessage: 'Password must be between 8 and 64 characters long'
    }
  }
};
