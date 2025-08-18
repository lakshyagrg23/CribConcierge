import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ChatWindow from "@/components/ChatWindow";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Grid, List, Filter, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showChat, setShowChat] = useState(true);
  const nav = useNavigate();
  const { properties, loading, error, refetch } = useProperties();

  // Add fallback images for properties without images
  const getPropertyImage = (index: number) => {
    const images = [property1, property2, property3];
    return images[index % images.length];
  };

  // Transform properties to include fallback images
  const savedProperties = properties.map((property, index) => ({
    ...property,
    image: getPropertyImage(index)
  }));

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
        <div className={`flex-1 transition-all duration-300 ${showChat ? 'mr-[28rem] max-[1024px]:mr-[40vw]' : ''}`}>
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
                <p className="text-sm text-muted-foreground mb-4">
                  {loading ? "Loading..." : `${savedProperties.length} properties ${error ? "(fallback data)" : "from database"}`}
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4 mr-1" />
                    View Saved
                  </Button>
                  {!loading && (
                    <Button variant="ghost" size="sm" onClick={refetch}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-foreground">
                    {loading ? "Loading Properties..." : "Saved Properties"}
                  </h2>
                  {error && (
                    <div className="flex items-center text-amber-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Using fallback data</span>
                    </div>
                  )}
                </div>
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
                  {!loading && (
                    <Button variant="ghost" size="sm" onClick={refetch} title="Refresh properties">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-surface p-6 rounded-2xl border border-border animate-pulse">
                      <div className="bg-muted h-48 rounded-lg mb-4"></div>
                      <div className="bg-muted h-4 rounded mb-2"></div>
                      <div className="bg-muted h-3 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`grid ${viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                  {savedProperties.map((property) => (
                    <PropertyCard key={property.id} {...property} />
                  ))}
                  
                  {savedProperties.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <div className="text-muted-foreground mb-4">
                        <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                        <p>No properties found</p>
                        <p className="text-sm">Add your first property to get started</p>
                      </div>
                      <Button variant="hero" onClick={() => nav("/addlisting")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Property
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="fixed right-0 top-16 w-[28rem] max-w-[40vw] h-[calc(100vh-4rem)] bg-background border-l border-border shadow-elegant-lg">
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