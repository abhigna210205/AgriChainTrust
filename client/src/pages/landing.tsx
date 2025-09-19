import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Shield, QrCode, Truck, Users, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="app-container">
        {/* Header */}
        <div className="status-bar">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5" />
            <span>FarmChain</span>
          </div>
          <div className="blockchain-badge">
            <Shield className="w-3 h-3 mr-1" />
            Secured
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary rounded-full mx-auto flex items-center justify-center">
              <Leaf className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Farm to Table Transparency
            </h1>
            <p className="text-muted-foreground text-lg">
              Track your food's journey with blockchain-secured supply chain transparency
            </p>
          </div>

          {/* Features */}
          <div className="grid gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">QR Code Tracking</CardTitle>
                    <CardDescription>Scan and track produce authenticity</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Certificate Verification</CardTitle>
                    <CardDescription>Authentic organic and quality certificates</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Supply Chain Transparency</CardTitle>
                    <CardDescription>Complete journey from farm to shelf</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* User Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Who Can Use FarmChain?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <div>
                  <span className="font-medium">Farmers</span>
                  <span className="text-muted-foreground ml-2">Register produce & certificates</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <div>
                  <span className="font-medium">Distributors</span>
                  <span className="text-muted-foreground ml-2">Track logistics & storage</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-accent" />
                <div>
                  <span className="font-medium">Consumers</span>
                  <span className="text-muted-foreground ml-2">Verify authenticity & origin</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="space-y-4">
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-login"
            >
              Get Started with FarmChain
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Join thousands of farmers, distributors, and consumers building a transparent food system
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
