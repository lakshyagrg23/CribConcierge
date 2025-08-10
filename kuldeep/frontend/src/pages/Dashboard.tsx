import { useState, } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ChatWindow from "@/components/ChatWindow";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Grid, List, Filter, Plus } from "lucide-react";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showChat, setShowChat] = useState(true);
  const nav=useNavigate();

  const savedProperties = [
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
    }
  ];

  const recentSearches = [
    "3-bedroom houses under $400k",
    "Pet-friendly apartments downtown",
    "Properties with parking"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${showChat ? 'mr-96' : ''}`}>
          <div className="p-6">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back!</h1>
              <p className="text-muted-foreground">Continue exploring properties with your AI assistant</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-primary p-6 rounded-2xl text-primary-foreground">
                <h3 className="text-lg font-semibold mb-2">Start New Search</h3>
                <p className="text-sm opacity-90 mb-4">Tell our AI what you're looking for</p>
                <Button 
                  variant="accent" 
                  size="sm"
                  onClick={() => setShowChat(true)}
                >
                  Ask Assistant
                </Button>
              </div>
              
              <div className="bg-surface p-6 rounded-2xl border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-2">Saved Properties</h3>
                <p className="text-sm text-muted-foreground mb-4">{savedProperties.length} properties saved</p>
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-1" />
                  View Saved
                </Button>
              </div>
              
              <div className="bg-surface p-6 rounded-2xl border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-2">List Property</h3>
                <p className="text-sm text-muted-foreground mb-4">Are you selling or renting?</p>
                <Button variant="hero" size="sm" onClick={()=>nav("/addlisting")}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Listing
                </Button>
              </div>
            </div>

            {/* Recent Searches */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Recent Searches</h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Saved Properties Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Saved Properties</h2>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'list' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className={`grid ${viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {savedProperties.map((property) => (
                  <PropertyCard key={property.id} {...property} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="fixed right-0 top-16 w-96 h-[calc(100vh-4rem)] bg-background border-l border-border shadow-elegant-lg">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Property Assistant</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowChat(false)}
              >
                ×
              </Button>
            </div>
            <div className="h-[calc(100%-4rem)]">
              <ChatWindow />
            </div>
          </div>
        )}

        {/* Chat Toggle Button (when chat is hidden) */}
        {!showChat && (
          <Button
            variant="hero"
            className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-elegant-lg"
            onClick={() => setShowChat(true)}
          >
            💬
          </Button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;