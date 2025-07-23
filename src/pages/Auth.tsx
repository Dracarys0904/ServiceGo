import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const { type } = useParams(); // 'customer' or 'provider'
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: ""
  });

  const isProvider = type === "provider";
  const isSignup = window.location.pathname.includes("/signup");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match.",
            variant: "destructive",
          });
          return;
        }

        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.name,
          isProvider ? "provider" : "customer"
        );

        if (error) {
          toast({
            title: "Error",
            description: error.message || "Failed to create account.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          toast({
            title: "Error",
            description: error.message || "Failed to sign in.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Welcome Back!",
          description: "You have been logged in successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-white font-display text-2xl font-bold">
            Service Direct Go
          </Link>
          <p className="text-white/80 mt-2">"Excellence delivered to your doorstep"</p>
        </div>

        <Card className="shadow-elegant border-0">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Badge variant={isProvider ? "default" : "secondary"} className="text-sm">
                {isProvider ? "🔧 Service Provider" : "👤 Customer"}
              </Badge>
            </div>
            <CardTitle className="text-2xl font-display">
              {isSignup ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {isSignup 
                ? `Join as a ${isProvider ? "service provider" : "customer"} and start ${isProvider ? "growing your business" : "booking amazing services"}`
                : "Sign in to your account to continue"
              }
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Processing..." : (isSignup ? "Create Account" : "Sign In")}
              </Button>

              <div className="text-center text-sm">
                {isSignup ? (
                  <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <Link 
                      to={`/login/${type}`} 
                      className="text-primary hover:underline font-medium"
                    >
                      Sign in here
                    </Link>
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Don't have an account?{" "}
                    <Link 
                      to={`/signup/${type}`} 
                      className="text-primary hover:underline font-medium"
                    >
                      Create one here
                    </Link>
                  </p>
                )}
              </div>

              <div className="text-center">
                <Link 
                  to={isProvider ? "/signup/customer" : "/signup/provider"}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Join as {isProvider ? "Customer" : "Service Provider"} instead
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Auth;