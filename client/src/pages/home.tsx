import { useAuth } from "@/hooks/useAuth";
import BottomNavigation from "@/components/bottom-navigation";
import SyncIndicator from "@/components/sync-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Truck, ShoppingCart, User, QrCode } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="app-container">
      {/* Status Bar */}
      <div className="status-bar">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4" />
          <span>FarmChain</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="blockchain-badge">
            <i className="fas fa-link mr-1"></i>
            Blockchain
          </div>
          <span>{new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
          })}</span>
        </div>
      </div>

      <SyncIndicator />

      <div className="p-4 space-y-6 pb-20">
        {/* Welcome Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {user?.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full object-cover" 
                />
              )}
              <div>
                <CardTitle data-testid="text-welcome">
                  Welcome, {user?.firstName || user?.email}!
                </CardTitle>
                <CardDescription>
                  Choose your role to get started
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Role Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">What would you like to do?</h2>
          
          <Link href="/farmer">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="card-farmer-role">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">I'm a Farmer</CardTitle>
                    <CardDescription>Register produce and manage certificates</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/distributor">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="card-distributor-role">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Truck className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">I'm a Distributor</CardTitle>
                    <CardDescription>Scan QR codes and track shipments</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/consumer">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="card-consumer-role">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">I'm a Consumer</CardTitle>
                    <CardDescription>Browse produce and verify authenticity</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" data-testid="button-scan-qr">
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR Code
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/api/logout'}
              data-testid="button-logout"
            >
              <User className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Floating QR Scanner */}
      <button className="floating-scan-btn" data-testid="button-floating-scan">
        <QrCode className="w-6 h-6" />
      </button>

      <BottomNavigation currentPath="/" />
    </div>
  );
}
