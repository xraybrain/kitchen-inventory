const router = require('express').Router();
const {
  getUsers,
  saveUser,
  updateUser,
  deleteUser,
  createUserInventory,
  userDashboard,
  getUser,
  resetPassword,
} = require('../controllers/user.controllers');

router.get('/users/', getUsers);
router.get('/user/:id', getUser);
router.post('/users/', saveUser);
router.post('/users/create/inventory/', createUserInventory);
router.put('/users/', updateUser);
router.put('/users/reset/password', resetPassword);
router.delete('/users/', deleteUser);
router.get('/users/dashboard', userDashboard);

module.exports = router;
