import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/bottom-navigation";
import SyncIndicator from "@/components/sync-indicator";
import QRScanner from "@/components/qr-scanner";
import ProduceCard from "@/components/produce-card";
import JourneyTimeline from "@/components/journey-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, QrCode, Star, Route, Leaf, Shield } from "lucide-react";
import type { ProduceBatch } from "@shared/schema";

export default function Consumer() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showScanner, setShowScanner] = useState(false);
  const [showJourney, setShowJourney] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Fetch available produce
  const { data: produce = [], isLoading: produceLoading } = useQuery<ProduceBatch[]>({
    queryKey: ["/api/produce-batches/available"],
  });

  // Fetch search results
  const { data: searchResults = [] } = useQuery<ProduceBatch[]>({
    queryKey: ["/api/produce-batches/search", searchQuery],
    enabled: searchQuery.length > 2,
  });

  const handleQRScan = (result: string) => {
    // Mock journey data for demonstration
    setCurrentBatch({
      id: "batch-123",
      cropType: "Organic Tomatoes",
      farmerName: "Rajesh Kumar Farm",
      quantity: "500kg",
      harvestDate: "2024-12-15",
    });
    setShowScanner(false);
    setShowJourney(true);
    toast({
      title: "QR Code Scanned",
      description: "Loading supply chain journey...",
    });
  };

  const displayedProduce = searchQuery.length > 2 ? searchResults : produce;
  const filteredProduce = selectedFilter === "all" 
    ? displayedProduce 
    : displayedProduce.filter((item: any) => {
        if (selectedFilter === "organic") return item.isOrganic;
        if (selectedFilter === "local") return item.location === user?.location;
        return true;
      });

  if (isLoading) {
    return <div className="app-container flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="app-container">
      {/* Status Bar */}
      <div className="status-bar">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          <span>FarmChain</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="blockchain-badge">
            <Shield className="w-3 h-3 mr-1" />
            Blockchain
          </div>
          <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
        </div>
      </div>

      <SyncIndicator />

      {/* Journey Modal */}
      {showJourney && currentBatch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Route className="w-5 h-5 text-primary" />
                Farm to Table Journey
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowJourney(false)}>
                ✕
              </Button>
            </CardHeader>
            <CardContent>
              <JourneyTimeline batchId={currentBatch.id} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Consumer Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white p-4">
        <h2 className="font-bold text-xl mb-2">Fresh & Verified Produce</h2>
        <p className="opacity-90">Track your food from farm to table</p>
      </div>

      <div className="p-4 space-y-4 pb-20">
        {/* Search and Filter */}
        <Card>
          <CardContent className="p-3">
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for produce..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-produce"
                />
              </div>
              <Button size="sm" className="px-4" data-testid="button-search">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <Badge
                variant={selectedFilter === "all" ? "default" : "secondary"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedFilter("all")}
                data-testid="filter-all"
              >
                All
              </Badge>
              <Badge
                variant={selectedFilter === "organic" ? "default" : "secondary"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedFilter("organic")}
                data-testid="filter-organic"
              >
                Organic
              </Badge>
              <Badge
                variant={selectedFilter === "local" ? "default" : "secondary"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedFilter("local")}
                data-testid="filter-local"
              >
                Local
              </Badge>
              <Badge
                variant={selectedFilter === "fresh" ? "default" : "secondary"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedFilter("fresh")}
                data-testid="filter-fresh"
              >
                Fresh
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Featured Produce */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />
              Featured Produce
            </CardTitle>
          </CardHeader>
          <CardContent>
            {produceLoading ? (
              <div>Loading produce...</div>
            ) : filteredProduce.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery.length > 2 
                  ? "No produce found matching your search." 
                  : "No produce available at the moment."}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProduce.map((item: any, index: number) => (
                  <ProduceCard key={item.id || index} produce={item} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Scanner for Consumers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              Track Your Purchase
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showScanner ? (
              <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-3">
                  Scan the QR code on your produce to view its complete journey from farm to shelf
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => setShowScanner(true)}
                  data-testid="button-scan-qr-consumer"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan QR Code
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating QR Scanner */}
      <button 
        className="floating-scan-btn" 
        onClick={() => setShowScanner(true)}
        data-testid="button-floating-scan"
      >
        <QrCode className="w-6 h-6" />
      </button>

      <BottomNavigation currentPath="/consumer" />
    </div>
  );
}
