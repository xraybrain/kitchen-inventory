const jwt = require('json-web-token');
require('dotenv').config();

module.exports = class AuthManager {
  static GetAuthUser(authorization) {
    let token = authorization.split(' ')[1];
    let decoded = jwt.decode(process.env.JWT_SECRET, token);
    let authUser;

    if (decoded.value && Math.floor(Date.now() / 1000) < decoded.value.exp) {
      authUser = {
        user: decoded.value.user,
        inventoryId: decoded.value.inventoryId,
        userType: decoded.value.userType,
      };
    } else {
      authUser = null;
    }
    return authUser;
  }
};
