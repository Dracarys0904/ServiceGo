import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Calendar, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const features = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Find Local Experts",
      description: "Discover skilled professionals in your area ready to tackle any job"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Book Instantly",
      description: "Schedule services at your convenience with real-time availability"
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Verified Reviews",
      description: "Make informed decisions with authentic customer feedback"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Trusted Community",
      description: "Join thousands of satisfied customers and top-rated providers"
    }
  ];

  const services = [
    "Computer Repair", "Plumbing", "Electrical", "Cleaning", "Painting", "Moving"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white py-20 px-4">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
            🚀 Your Local Service Marketplace
          </Badge>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
            Service Direct
            <span className="block text-accent">Go</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            "Excellence delivered to your doorstep" - Connect with verified local professionals 
            and get things done the right way, the first time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-elegant">
              <Link to="/signup/customer">Find Services</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              <Link to="/signup/provider">Become a Provider</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-4">Popular Services</h2>
          <p className="text-muted-foreground text-center mb-12">
            "From fixing to transforming" - We've got every service you need
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service) => (
              <Card key={service} className="hover:shadow-card transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="h-6 w-6 bg-primary rounded-sm"></div>
                  </div>
                  <h3 className="font-semibold text-sm">{service}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">Why Choose Service Direct Go?</h2>
            <p className="text-xl text-muted-foreground">
              "Where quality meets convenience" - Experience the future of local services
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-card hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-8">
                  <div className="text-primary mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-display font-bold mb-2">1000+</div>
              <div className="text-primary-foreground/80">Verified Providers</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold mb-2">50k+</div>
              <div className="text-primary-foreground/80">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold mb-2">99%</div>
              <div className="text-primary-foreground/80">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-accent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-display font-bold mb-6 text-accent-foreground">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-accent-foreground/80">
            "Your next great service experience is just one click away"
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 shadow-elegant">
            <Link to="/login">Get Started Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-display font-bold mb-4">Service Direct Go</h3>
          <p className="text-background/70 mb-6">"Excellence delivered to your doorstep"</p>
          <div className="flex justify-center space-x-8 text-sm text-background/60">
            <Link to="/about" className="hover:text-background transition-colors">About</Link>
            <Link to="/contact" className="hover:text-background transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-background transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-background transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;