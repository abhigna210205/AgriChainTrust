import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProduceBatchSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNavigation from "@/components/bottom-navigation";
import SyncIndicator from "@/components/sync-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Leaf, Plus, History, QrCode, Award, Shield, Calendar, Package } from "lucide-react";
import { z } from "zod";
import type { ProduceBatch } from "@shared/schema";

const formSchema = insertProduceBatchSchema.extend({
  harvestDate: z.string(),
  quantity: z.string().min(1, "Quantity is required"),
  pricePerUnit: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function Farmer() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: "",
      varietyName: "",
      quantity: "",
      unit: "kg",
      harvestDate: new Date().toISOString().split('T')[0],
      pricePerUnit: "",
      isOrganic: false,
    },
  });

  // Fetch user's produce batches
  const { data: batches = [], isLoading: batchesLoading } = useQuery<ProduceBatch[]>({
    queryKey: ["/api/produce-batches/user", user?.id],
    enabled: !!user?.id,
  });

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ["/api/farmer-stats", user?.id],
    enabled: !!user?.id,
  });

  // Create produce batch mutation
  const createBatchMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      const response = await apiRequest("POST", "/api/produce-batches", formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Produce batch registered successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/produce-batches/user"] });
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to register produce batch",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="app-container flex items-center justify-center min-h-screen">Loading...</div>;
  }

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
            <Shield className="w-3 h-3 mr-1" />
            Blockchain
          </div>
          <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
        </div>
      </div>

      <SyncIndicator />

      {/* Farmer Profile Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-4">
        <div className="flex items-center gap-3">
          {user?.profileImageUrl && (
            <img 
              src={user.profileImageUrl} 
              alt="Farmer profile" 
              className="w-12 h-12 rounded-full object-cover" 
              data-testid="img-farmer-profile"
            />
          )}
          <div>
            <h2 className="font-bold text-lg" data-testid="text-farmer-name">
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email}
            </h2>
            <p className="opacity-90 text-sm" data-testid="text-farmer-location">
              {user?.location || "Location not set"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="verification-badge">
            <Award className="w-3 h-3" />
            {user?.isVerified ? "Verified Farmer" : "Pending Verification"}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-20">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="text-primary font-bold text-xl" data-testid="text-batches-count">
                {batches?.length || 0}
              </div>
              <div className="text-muted-foreground text-sm">Batches</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="text-secondary font-bold text-xl" data-testid="text-total-revenue">
                ₹{stats?.revenue || 0}
              </div>
              <div className="text-muted-foreground text-sm">Revenue</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="text-accent font-bold text-xl" data-testid="text-avg-rating">
                {stats?.rating || "4.8"}
              </div>
              <div className="text-muted-foreground text-sm">Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Register New Produce */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Register New Produce
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createBatchMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="cropType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-crop-type">
                            <SelectValue placeholder="Select crop type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rice">Rice (Basmati)</SelectItem>
                          <SelectItem value="wheat">Wheat</SelectItem>
                          <SelectItem value="tomatoes">Tomatoes</SelectItem>
                          <SelectItem value="onions">Onions</SelectItem>
                          <SelectItem value="potatoes">Potatoes</SelectItem>
                          <SelectItem value="cabbage">Cabbage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="varietyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variety Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Organic, Premium" {...field} value={field.value || ""} data-testid="input-variety" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="harvestDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harvest Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-harvest-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1000" 
                            {...field} 
                            data-testid="input-quantity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="pricePerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per {form.watch("unit")} (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="50.00" 
                          {...field} 
                          data-testid="input-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createBatchMutation.isPending}
                  data-testid="button-register-batch"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  {createBatchMutation.isPending ? "Registering..." : "Generate QR & Register on Blockchain"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Recent Batches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Recent Batches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {batchesLoading ? (
              <div>Loading batches...</div>
            ) : batches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No produce batches registered yet. Create your first batch above!
              </div>
            ) : (
              <div className="space-y-3">
                {batches.map((batch: any) => (
                  <div key={batch.id} className="flex items-center justify-between p-3 bg-muted rounded-lg" data-testid={`card-batch-${batch.id}`}>
                    <div className="flex items-center gap-3">
                      <Package className="w-10 h-10 p-2 bg-primary/10 rounded text-primary" />
                      <div>
                        <div className="font-medium" data-testid={`text-batch-name-${batch.id}`}>
                          {batch.varietyName ? `${batch.varietyName} ${batch.cropType}` : batch.cropType}
                        </div>
                        <div className="text-sm text-muted-foreground" data-testid={`text-batch-date-${batch.id}`}>
                          {new Date(batch.harvestDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={batch.status === "registered" ? "default" : "secondary"} className="text-xs">
                        {batch.isOrganic && <Leaf className="w-3 h-3 mr-1" />}
                        {batch.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1" data-testid={`text-batch-quantity-${batch.id}`}>
                        {batch.quantity}{batch.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating QR Scanner */}
      <button className="floating-scan-btn" data-testid="button-floating-scan">
        <QrCode className="w-6 h-6" />
      </button>

      <BottomNavigation currentPath="/farmer" />
    </div>
  );
}
