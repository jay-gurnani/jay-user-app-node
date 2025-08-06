import express from "express";
import { signupHandler, loginHandler, logoutHandler, meHandler, confirmSignUpHandler, resendConfirmationCodeHandler, forgotPasswordHandler, confirmForgotPasswordHandler } from "./authHandlers.js";

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

    // Set regular headers
    if (result.headers) {
      for (const [key, value] of Object.entries(result.headers)) {
        res.setHeader(key, value);
      }
    }

    // Set multi-value headers like Set-Cookie
    if (result.multiValueHeaders) {
      for (const [key, values] of Object.entries(result.multiValueHeaders)) {
        if (Array.isArray(values)) {
          for (const val of values) {
            res.append(key, val); // append multiple Set-Cookie headers
          }
        }
      }
    }

    res.status(result.statusCode).json(body);
  } catch (err) {
    console.error("Login route error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const result = await logoutHandler();
    const body = JSON.parse(result.body);

    // Extract Set-Cookie header and apply it to res
    if (result.headers && result.headers["Set-Cookie"]) {
      res.setHeader("Set-Cookie", result.headers["Set-Cookie"]);
    }

    res.status(result.statusCode).json(body);
  } catch (err) {
    console.error("Logout route error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const result = await meHandler({ headers: req.headers });
    const body = JSON.parse(result.body);
    if (result.headers?.["Set-Cookie"]) {
      res.setHeader("Set-Cookie", result.headers["Set-Cookie"]);
    }
    res.status(result.statusCode).json(body);
  } catch (err) {
    console.error("Me route error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/confirm-code", async (req, res) => {
  try {
    const result = await confirmSignUpHandler({ body: JSON.stringify(req.body) });
    const body = JSON.parse(result.body);
    res.status(result.statusCode).json(body);
  } catch (err) {
    console.error("Confirm code error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/resend-code", async (req, res) => {
  try {
    const result = await resendConfirmationCodeHandler({ body: JSON.stringify(req.body) });
    const body = JSON.parse(result.body);
    res.status(result.statusCode).json(body);
  } catch (err) {
    console.error("Resend code error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const result = await forgotPasswordHandler({ body: JSON.stringify(req.body) });
    const body = JSON.parse(result.body);
    res.status(result.statusCode).json(body);
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/confirm-forgot-password", async (req, res) => {
  try {
    const result = await confirmForgotPasswordHandler({ body: JSON.stringify(req.body) });
    const body = JSON.parse(result.body);
    res.status(result.statusCode).json(body);
  } catch (err) {
    console.error("Confirm forgot password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
