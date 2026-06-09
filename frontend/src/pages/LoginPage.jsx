import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Fuel, Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import StationBackground from "../components/3d/StationBackground";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const success = await login(username, password);

    if (success) {
      toast.success("Welcome back!", {
        description: "You have been successfully logged in.",
      });
      navigate("/dashboard", { replace: true });
    } else {
      setError("Invalid email or password");
    }

    setIsLoading(false);
  };


  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden">
      <StationBackground />

      {/* Content */}
      <div className="w-full max-w-md p-4 relative z-10 animate-fade-in-up">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center justify-center mb-8 text-center text-white">
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 mb-4 shadow-xl shadow-yellow-500/20 overflow-hidden">
            <img src="/logo.png" alt="PetroManager Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
            PetroManager
          </h1>
          <p className="text-yellow-200/80 mt-2">
            Fuel Station Management System
          </p>
        </div>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-6 space-y-1 text-center">
            <CardTitle className="text-2xl text-white">Station Login</CardTitle>
            <CardDescription className="text-yellow-200/60">
              Enter your credentials to manage the station
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-red-500/10 border border-red-500/20 text-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-yellow-100">Username</Label>
                <div className="relative">
                  <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-yellow-300/50" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter the username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-yellow-200/30 focus-visible:ring-yellow-500/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-yellow-100">Password</Label>
                  <a href="#" className="text-xs text-yellow-400 hover:text-yellow-300">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-yellow-300/50" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter the password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-yellow-200/30 focus-visible:ring-yellow-500/50"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-yellow-600 to-orange-700 hover:from-yellow-500 hover:to-orange-600 text-white border-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 bg-transparent text-yellow-200/50">
                    System Access
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-1 text-sm rounded-lg bg-white/5 border border-white/10 text-yellow-200/80">
                <p>
                  <span className="text-yellow-200/40">Username: Admin</span>
                  <br />
                  <span className="text-yellow-200/40">Password: Sample123@</span>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="mt-8 text-sm text-center text-yellow-200/40">
          © 2026 PetroManager Fuel Station Management
        </p>
      </div>
    </div>
  );
}
