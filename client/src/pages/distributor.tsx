import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNavigation from "@/components/bottom-navigation";
import SyncIndicator from "@/components/sync-indicator";
import QRScanner from "@/components/qr-scanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Truck, QrCode, Shield, Thermometer, Droplet, Calendar, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const logisticsSchema = z.object({
  storageConditions: z.string().min(1, "Storage conditions are required"),
  temperature: z.string().optional(),
  humidity: z.string().optional(),
  expectedDelivery: z.string().optional(),
});

type LogisticsData = z.infer<typeof logisticsSchema>;

export default function Distributor() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showScanner, setShowScanner] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<any>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const form = useForm<LogisticsData>({
    resolver: zodResolver(logisticsSchema),
    defaultValues: {
      storageConditions: "",
      temperature: "",
      humidity: "",
      expectedDelivery: "",
    },
  });

  const handleQRScan = (result: string) => {
    // Mock batch data for demonstration
    setCurrentBatch({
      id: "batch-123",
      cropType: "Organic Tomatoes",
      farmerName: "Rajesh Kumar Farm",
      quantity: "500kg",
      harvestDate: "2024-12-15",
    });
    setShowScanner(false);
    toast({
      title: "QR Code Scanned",
      description: "Batch information loaded successfully",
    });
  };

  const handleUpdateLogistics = (data: LogisticsData) => {
    toast({
      title: "Logistics Updated",
      description: "Supply chain record added to blockchain",
    });
    setCurrentBatch(null);
    form.reset();
  };

  if (isLoading) {
    return <div className="app-container flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="app-container">
      {/* Status Bar */}
      <div className="status-bar">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4" />
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

      {/* Distributor Profile Header */}
      <div className="bg-gradient-to-r from-secondary to-primary text-white p-4">
        <div className="flex items-center gap-3">
          {user?.profileImageUrl && (
            <img 
              src={user.profileImageUrl} 
              alt="Distribution center" 
              className="w-12 h-12 rounded-full object-cover" 
              data-testid="img-distributor-profile"
            />
          )}
          <div>
            <h2 className="font-bold text-lg" data-testid="text-distributor-name">
              {user?.organizationName || `${user?.firstName} ${user?.lastName}` || user?.email}
            </h2>
            <p className="opacity-90 text-sm" data-testid="text-distributor-location">
              {user?.location || "Location not set"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-20">
        {/* QR Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-secondary" />
              Scan Produce QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showScanner ? (
              <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
            ) : (
              <div className="space-y-4">
                <div className="qr-scanner flex items-center justify-center text-white">
                  <div className="text-center">
                    <QrCode className="w-12 h-12 mx-auto mb-2" />
                    <p>Position QR code within the frame</p>
                  </div>
                </div>
                <Button 
                  className="w-full bg-secondary" 
                  onClick={() => setShowScanner(true)}
                  data-testid="button-start-camera"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Start Camera
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Shipment */}
        {currentBatch && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-secondary" />
                Current Shipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium" data-testid="text-current-batch-name">
                      {currentBatch.cropType}
                    </div>
                    <div className="text-sm text-muted-foreground" data-testid="text-current-batch-farmer">
                      From: {currentBatch.farmerName}
                    </div>
                  </div>
                  <Badge className="bg-secondary text-xs">
                    <Truck className="w-3 h-3 mr-1" />
                    In Transit
                  </Badge>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleUpdateLogistics)} className="space-y-3">
                    <FormField
                      control={form.control}
                      name="storageConditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Storage Conditions</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-storage-conditions">
                                <SelectValue placeholder="Select storage conditions" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cold-storage">Cold Storage (2-4°C)</SelectItem>
                              <SelectItem value="room-temperature">Room Temperature</SelectItem>
                              <SelectItem value="controlled-atmosphere">Controlled Atmosphere</SelectItem>
                              <SelectItem value="frozen">Frozen Storage</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="temperature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Temperature (°C)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="3" 
                                {...field} 
                                data-testid="input-temperature"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="humidity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Humidity (%)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="85" 
                                {...field} 
                                data-testid="input-humidity"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="expectedDelivery"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Delivery</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              {...field} 
                              data-testid="input-expected-delivery"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-primary"
                      data-testid="button-update-blockchain"
                    >
                      Update Blockchain Record
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shipment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-secondary" />
              Recent Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg" data-testid="card-shipment-history-1">
                <div className="flex items-center gap-3">
                  <Package className="w-10 h-10 p-2 bg-primary/10 rounded text-primary" />
                  <div>
                    <div className="font-medium text-sm" data-testid="text-shipment-name-1">Basmati Rice</div>
                    <div className="text-xs text-muted-foreground" data-testid="text-shipment-date-1">Dec 14, 2024</div>
                  </div>
                </div>
                <Badge className="bg-primary text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Delivered
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg" data-testid="card-shipment-history-2">
                <div className="flex items-center gap-3">
                  <Package className="w-10 h-10 p-2 bg-accent/10 rounded text-accent" />
                  <div>
                    <div className="font-medium text-sm" data-testid="text-shipment-name-2">Organic Onions</div>
                    <div className="text-xs text-muted-foreground" data-testid="text-shipment-date-2">Dec 13, 2024</div>
                  </div>
                </div>
                <Badge className="bg-secondary text-xs">
                  <Truck className="w-3 h-3 mr-1" />
                  In Transit
                </Badge>
              </div>
            </div>
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

      <BottomNavigation currentPath="/distributor" />
    </div>
  );
}
