

import express from "express";
import { forgotPassword, login, register, resetPassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router()

router.post("/register",register)
router.post("/login",login)
router.post("/forget",forgotPassword)
router.patch("/reset/:token",resetPassword)


export {router}