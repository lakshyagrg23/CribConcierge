import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Send, MessageCircle, Home, DollarSign, MapPin } from "lucide-react";
import PropertyCard from "./PropertyCard";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  properties?: any[];
  timestamp: Date;
}

const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm your real estate assistant. I can help you find the perfect property. What are you looking for?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  // const sampleProperties = [
  //   {
  //     id: "1",
  //     title: "Modern Downtown Apartment",
  //     price: "$450,000",
  //     location: "Downtown District",
  //     bedrooms: 2,
  //     bathrooms: 2,
  //     area: "850 sq ft",
  //     image: property1,
  //     features: ["Pet Friendly", "Parking"]
  //   },
  //   {
  //     id: "2", 
  //     title: "Suburban Family Home",
  //     price: "$320,000",
  //     location: "Maple Heights",
  //     bedrooms: 3,
  //     bathrooms: 2,
  //     area: "1,200 sq ft",
  //     image: property2,
  //     features: ["Garden", "Garage"]
  //   },
  //   {
  //     id: "3",
  //     title: "Luxury Penthouse",
  //     price: "$850,000", 
  //     location: "City Center",
  //     bedrooms: 3,
  //     bathrooms: 3,
  //     area: "1,500 sq ft",
  //     image: property3,
  //     features: ["Balcony", "Premium"]
  //   }
  // ];

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Simulate API call
    const response=axios.get("http://localhost:5090/askIt",{
      params: { question: inputValue }
    }).then(res => {
      console.log("Response from backend:", res.data);
      // Assuming the response contains the bot's reply
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: res.data.answer,
        // properties: sampleProperties, // Include sample properties in the response
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }).catch(err => {
      console.error("Error fetching response:", err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "Sorry, I couldn't process your request. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    })

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I found some great properties matching your criteria! Here are my top recommendations:",
        // properties: sampleProperties,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
    
    setInputValue("");
  };

  const handleQuickReply = (text: string) => {
    setInputValue(text);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-surface relative">
      <div className="absolute inset-0 stone-texture opacity-30" />
      <div className="p-6 border-b border-border bg-gradient-to-r from-surface via-background to-surface relative shadow-elegant-md">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <MessageCircle className="h-6 w-6 text-primary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-accent rounded-full animate-pulse" />
          </div>
          <h2 className="text-xl font-bold premium-gradient">Premium Property Assistant</h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-2xl shadow-elegant-md transition-all duration-300 hover:shadow-elegant-lg ${
              message.type === 'user' 
                ? 'bg-gradient-primary text-primary-foreground shadow-brick' 
                : 'luxury-card'
            }`}>
              <p className="text-sm leading-relaxed font-medium">{message.content}</p>
              {message.properties && (
                <div className="mt-6 space-y-4">
                  {message.properties.map((property) => (
                    <div key={property.id} className="luxury-card p-4 transform hover:scale-[1.02] transition-all duration-300">
                      <PropertyCard {...property} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 border-t border-border bg-gradient-to-r from-surface via-background to-surface relative shadow-elegant-md">
        <div className="flex space-x-3">
          <div className="luxury-card flex-1 p-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about luxury properties, architectural styles..."
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="border-0 bg-transparent text-base font-medium"
            />
          </div>
          <Button onClick={handleSend} size="icon" variant="hero" className="shadow-luxury hover:scale-110 transition-all duration-300">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;