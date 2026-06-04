import express from "express";
import { authenticateToken } from "./middleware/jwt";

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../services/general/user";
import {
  createRoles,
  deleteRoles,
  getRoles,
  getRolesById,
  updateRoles,
} from "../services/general/roles";
import {
  createStage,
  deleteStage,
  getStageById,
  getStages,
  updateStage,
} from "../services/master/m_stage";

const router = express.Router();
// master user
router.post(`/users`, createUser); // CREATE (no auth for registration)
router.get(`/users`, authenticateToken, getUsers); // READ All (protected)
router.get("/users/:id", authenticateToken, getUserById); // READ Single (protected)
router.put("/users/:id", authenticateToken, updateUser); // UPDATE (protected)
router.delete("/users/:id", authenticateToken, deleteUser); // DELETE (protected)

router.post(`/roles`, createRoles);
router.get(`/roles`, authenticateToken, getRoles);
router.get("/roles/:id", authenticateToken, getRolesById);
router.put("/roles/:id", authenticateToken, updateRoles);
router.delete("/roles/:id", authenticateToken, deleteRoles);

router.post(`/stages`, authenticateToken, createStage);
router.get(`/stages`, authenticateToken, getStages);
router.get("/stages/:id", authenticateToken, getStageById);
router.put("/stages/:id", authenticateToken, updateStage);
router.delete("/stages/:id", authenticateToken, deleteStage);

export default router;
