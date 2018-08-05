module.exports = {
  errorFormatter(param, msg, value) {
    return {
      param,
      description: msg
    };
  },
  customValidators: {
    isArray(value) {
      return Array.isArray(value);
    },
    isObject(value) {
      return typeof value === 'object';
    },
    isIntArray(value) {
      if (!this.isArray(value)) {
        return false;
      }

      try {
        value.forEach(function (element) {
          if (!Number.isInteger(element)) {
            throw new Error();
          }
        });
      } catch (error) {
        return false;
      }

      return true;
    }
  },
  customSanitizers: {
    toArray(value) {
      try {
        var array = JSON.parse(value);
      } catch(error) {
        return null;
      }
      
      return Array.isArray(array) ? array : null;
    }
  }
};