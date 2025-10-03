// src/pages/Login.jsx
import { useState } from "react";
import {
  Box, Button, Card, CardContent, CardHeader, CircularProgress,
  IconButton, InputAdornment, TextField, Typography
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { ApiService } from "../services/ApiService";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key) => (ev) => {
    setForm((f) => ({ ...f, [key]: ev.target.value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
    if (serverError) setServerError("");
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      setServerError("");

      // 1) Request JWT
      const res = await ApiService.login(form.email.trim(), form.password);
      // Expected: { token: "...", user: { ... } }
      if (!res?.token) throw new Error("Login failed: token missing");

      // 2) Save to auth context
      signIn(res.token, res.user);

      // 3) Redirect to intended page or dashboard
      const redirectTo = location.state?.from || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 420, borderRadius: 4 }}>
        <CardHeader
          title="Sign in"
          subheader="Access your account to continue"
        />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={handleChange("email")}
              error={!!errors.email}
              helperText={errors.email}
              autoComplete="email"
            />

            <TextField
              label="Password"
              type={showPw ? "text" : "password"}
              fullWidth
              margin="normal"
              value={form.password}
              onChange={handleChange("password")}
              error={!!errors.password}
              helperText={errors.password}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPw((s) => !s)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                      edge="end"
                    >
                      {showPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {serverError ? (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {serverError}
              </Typography>
            ) : null}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={22} /> : "Login"}
            </Button>

            <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
              Don’t have an account?{" "}
              <Link to="/signup">Create one</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
