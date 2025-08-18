import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Shield, Clock } from "lucide-react";
import Header from "@/components/Header";
import PropertyCard from "@/components/PropertyCard";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const Home = () => {
  const featuredProperties = [
    {
      id: "1",
      title: "Modern Downtown Apartment",
      price: "$450,000",
      location: "Downtown District",
      bedrooms: 2,
      bathrooms: 2,
      area: "850 sq ft",
      image: property1,
      features: ["Pet Friendly", "Parking"]
    },
    {
      id: "2",
      title: "Suburban Family Home",
      price: "$320,000",
      location: "Maple Heights",
      bedrooms: 3,
      bathrooms: 2,
      area: "1,200 sq ft",
      image: property2,
      features: ["Garden", "Garage"]
    },
    {
      id: "3",
      title: "Luxury Penthouse",
      price: "$850,000",
      location: "City Center",
      bedrooms: 3,
      bathrooms: 3,
      area: "1,500 sq ft",
      image: property3,
      features: ["Balcony", "Premium"]
    }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: "Smart Search",
      description: "AI-powered property matching based on your preferences"
    },
    {
      icon: Shield,
      title: "Verified Listings",
      description: "All properties are verified and up-to-date"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Get help anytime with our intelligent assistant"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-surface relative">
      <div className="absolute inset-0 brick-pattern opacity-30" />
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 stone-texture" />
        <div className="container mx-auto text-center relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-primary/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <div className="w-2 h-2 bg-gradient-accent rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">Premium Real Estate Experience</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 animate-slide-up">
            Find Your Perfect
            <span className="block premium-gradient text-6xl md:text-8xl">
              Dream Home
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-slide-up leading-relaxed">
            Experience luxury real estate with our AI-powered assistant. Discover properties that match your lifestyle, budget, and architectural dreams.
          </p>
          
          <div className="max-w-3xl mx-auto mb-12 animate-slide-up">
            <div className="luxury-card p-3">
              <div className="flex bg-gradient-to-r from-background via-surface to-background rounded-xl shadow-luxury">
                <Input 
                  placeholder="Search by location, price, architectural style..."
                  className="border-0 bg-transparent text-lg font-medium flex-1"
                />
                <Button variant="hero" size="lg" className="px-10 shadow-brick">
                  <Search className="h-5 w-5 mr-2" />
                  Search Properties
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up">
            <Button variant="accent" size="lg" asChild className="shadow-luxury">
              <Link to="/dashboard">Try AI Assistant</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-2 border-primary/20 hover:border-primary/40">
              <Link to="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-surface relative">
        <div className="absolute inset-0 marble-texture" />
        <div className="container mx-auto relative">
          <h2 className="text-4xl font-bold text-center text-foreground mb-16 premium-gradient">
            Why Choose CribConcierge?
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="luxury-card text-center p-8 hover:scale-105 group"
                >
                  <div className="w-20 h-20 bg-gradient-luxury rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-luxury group-hover:scale-110 transition-all duration-500">
                    <Icon className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 stone-texture opacity-50" />
        <div className="container mx-auto relative">
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-4xl font-bold text-foreground premium-gradient">Featured Properties</h2>
            <Button variant="outline" asChild className="border-2 border-primary/30 hover:border-primary shadow-elegant-md">
              <Link to="/search">View All Properties</Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-luxury text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 brick-texture opacity-20" />
        <div className="absolute top-10 left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary-glow/20 rounded-full blur-3xl" />
        <div className="container mx-auto text-center relative">
          <h2 className="text-5xl font-bold mb-6">Ready to Find Your Dream Home?</h2>
          <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Join thousands of happy homeowners who found their perfect architectural match with our premium AI assistant.
          </p>
          <Button variant="accent" size="lg" asChild className="shadow-luxury px-12 py-4 text-lg">
            <Link to="/signup">Start Your Luxury Journey</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;