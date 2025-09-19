import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, Shield, Calendar, MapPin } from "lucide-react";

interface ProduceCardProps {
  produce: {
    id: string;
    cropType: string;
    varietyName?: string;
    quantity: number;
    unit: string;
    pricePerUnit?: number;
    harvestDate: string;
    isOrganic: boolean;
    status: string;
    farmer?: {
      firstName?: string;
      lastName?: string;
      organizationName?: string;
      location?: string;
    };
  };
}

export default function ProduceCard({ produce }: ProduceCardProps) {
  const farmerName = produce.farmer?.organizationName || 
    `${produce.farmer?.firstName} ${produce.farmer?.lastName}` || 
    "Unknown Farmer";

  const displayName = produce.varietyName 
    ? `${produce.varietyName} ${produce.cropType}`
    : produce.cropType;

  return (
    <div className="flex gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow" data-testid={`card-produce-${produce.id}`}>
      {/* Placeholder for produce image */}
      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
        <Leaf className="w-8 h-8 text-primary" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium" data-testid={`text-produce-name-${produce.id}`}>
              {displayName}
            </h4>
            <p className="text-sm text-muted-foreground" data-testid={`text-farmer-name-${produce.id}`}>
              {farmerName}
            </p>
            {produce.farmer?.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1" data-testid={`text-farmer-location-${produce.id}`}>
                <MapPin className="w-3 h-3" />
                {produce.farmer.location}
              </p>
            )}
          </div>
          <div className="text-right">
            {produce.pricePerUnit && (
              <div className="font-bold text-primary" data-testid={`text-price-${produce.id}`}>
                ₹{produce.pricePerUnit}/{produce.unit}
              </div>
            )}
            <div className="text-xs text-muted-foreground" data-testid={`text-quantity-${produce.id}`}>
              Available: {produce.quantity}{produce.unit}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {produce.isOrganic && (
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
              <Leaf className="w-3 h-3 mr-1" />
              Organic
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs bg-secondary/10 text-secondary">
            <Shield className="w-3 h-3 mr-1" />
            Verified
          </Badge>
          <div className="text-xs text-muted-foreground flex items-center gap-1" data-testid={`text-harvest-date-${produce.id}`}>
            <Calendar className="w-3 h-3" />
            Harvest: {new Date(produce.harvestDate).toLocaleDateString()}
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t">
          <Button size="sm" variant="outline" className="text-xs h-7">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
