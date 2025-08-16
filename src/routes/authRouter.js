

import express from "express";
import { forgotPassword, login, register, resetPassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router()

router.post("/register",register)
router.post("/login",login)
router.post("/forget-password",forgotPassword)
router.patch("/reset-password/:token",resetPassword)


export {router}