const User = require('./User');

class Admin extends User {
  approveClaim() {
    return "Claim approved";
  }

  getDashboardAccess() {
    return true;
  }
}

module.exports = Admin;