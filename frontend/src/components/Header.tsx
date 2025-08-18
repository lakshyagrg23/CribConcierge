import { Button } from "@/components/ui/button";
import { Home, Search, User, Menu } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-xl shadow-elegant-md">
      <div className="absolute inset-0 brick-pattern pointer-events-none" />
      <div className="container mx-auto flex h-18 items-center justify-between px-6 relative">
        <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-all duration-300 group">
          <div className="relative">
            <Home className="h-9 w-9 text-primary group-hover:text-accent transition-colors duration-300" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-accent rounded-full opacity-80" />
          </div>
          <span className="text-2xl font-bold premium-gradient">CribConcierge</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-foreground hover:text-primary transition-all duration-300 font-medium relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300" />
          </Link>
          <Link to="/search" className="text-foreground hover:text-primary transition-all duration-300 font-medium relative group">
            Search
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300" />
          </Link>
          <Link to="/dashboard" className="text-foreground hover:text-primary transition-all duration-300 font-medium relative group">
            Dashboard
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300" />
          </Link>
        </nav>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" asChild className="hidden md:flex font-medium">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button variant="hero" size="sm" asChild className="shadow-luxury">
            <Link to="/signup">Get Started</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;