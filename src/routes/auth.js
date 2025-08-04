import express from "express";
import { signupHandler, loginHandler } from "./authHandlers.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const result = await signupHandler({ body: JSON.stringify(req.body) });
    const body = JSON.parse(result.body);
    res.status(result.statusCode).json(body);
  } catch (err) {
    console.error("Signup route error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const result = await loginHandler({ body: JSON.stringify(req.body) });
    const body = JSON.parse(result.body);
    res.status(result.statusCode).json(body);
  } catch (err) {
    console.error("Login route error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
