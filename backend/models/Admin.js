const User = require('./User');

class Admin extends User {
  constructor(id, name, email, role) {
    super(id, name, email, role);
  }

  approveClaim() {
    return "Claim approved";
  }

  getDashboardAccess() {
    return true;
  }
}

module.exports = Admin;