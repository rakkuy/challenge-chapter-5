const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUserProfile,

  // deleteUser,
} = require("../controllers/users.controller");
const { verifyToken } = require("../middlewares/verivyToken");

router.post("/", verifyToken, createUser);
router.get("/", getUsers);
router.get("/:userId", getUserById);
router.put("/:userId", verifyToken, updateUserProfile);

// router.delete("/:userId", deleteUser);

module.exports = router;
