import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Leaf, Truck, Store, Calendar, Thermometer, Droplet } from "lucide-react";

interface JourneyTimelineProps {
  batchId: string;
}

export default function JourneyTimeline({ batchId }: JourneyTimelineProps) {
  // In a real implementation, this would fetch actual supply chain records
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["/api/supply-chain-records", batchId],
    // For demo purposes, we'll use mock data
    queryFn: () => Promise.resolve([
      {
        id: "1",
        recordType: "harvest",
        timestamp: "2024-12-15T08:00:00Z",
        location: "Rajesh Kumar Farm, Punjab",
        qualityNotes: "Organic Tomatoes harvested",
        user: { organizationName: "Rajesh Kumar Farm" },
      },
      {
        id: "2",
        recordType: "transport",
        timestamp: "2024-12-16T10:00:00Z",
        location: "En route to Delhi",
        temperature: 3,
        humidity: 85,
        qualityNotes: "Cold storage transport (2-4°C)",
        user: { organizationName: "Green Valley Logistics" },
      },
      {
        id: "3",
        recordType: "retail",
        timestamp: "2024-12-17T14:00:00Z",
        location: "Fresh Mart, Delhi",
        qualityNotes: "Arrived at retail store",
        user: { organizationName: "Fresh Mart" },
      },
    ]),
  });

  const getStepIcon = (recordType: string) => {
    switch (recordType) {
      case "harvest":
        return <Leaf className="w-4 h-4 text-primary" />;
      case "transport":
        return <Truck className="w-4 h-4 text-secondary" />;
      case "retail":
        return <Store className="w-4 h-4 text-accent" />;
      default:
        return <Calendar className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStepTitle = (recordType: string) => {
    switch (recordType) {
      case "harvest":
        return "Farm Registration";
      case "transport":
        return "Transportation";
      case "retail":
        return "Retail Store";
      default:
        return recordType;
    }
  };

  if (isLoading) {
    return <div>Loading journey...</div>;
  }

  return (
    <div className="journey-timeline" data-testid="timeline-journey">
      {records.map((record: any, index: number) => (
        <div key={record.id} className="journey-step" data-testid={`timeline-step-${index}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getStepIcon(record.recordType)}
              <span className="font-medium" data-testid={`step-title-${index}`}>
                {getStepTitle(record.recordType)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground" data-testid={`step-date-${index}`}>
              {new Date(record.timestamp).toLocaleDateString()}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2" data-testid={`step-description-${index}`}>
            {record.qualityNotes}
          </p>
          
          {record.location && (
            <p className="text-xs text-muted-foreground mb-2" data-testid={`step-location-${index}`}>
              📍 {record.location}
            </p>
          )}
          
          <div className="flex items-center gap-2 flex-wrap">
            {record.recordType === "harvest" && (
              <>
                <Badge className="verification-badge text-xs">
                  <Leaf className="w-3 h-3 mr-1" />
                  Organic Cert
                </Badge>
                <Badge className="blockchain-badge text-xs">
                  Verified on Blockchain
                </Badge>
              </>
            )}
            
            {record.temperature && (
              <div className="text-xs text-muted-foreground flex items-center gap-1" data-testid={`step-temperature-${index}`}>
                <Thermometer className="w-3 h-3" />
                Temperature: {record.temperature}°C
              </div>
            )}
            
            {record.humidity && (
              <div className="text-xs text-muted-foreground flex items-center gap-1" data-testid={`step-humidity-${index}`}>
                <Droplet className="w-3 h-3" />
                Humidity: {record.humidity}%
              </div>
            )}
          </div>
          
          {record.user?.organizationName && (
            <p className="text-xs text-muted-foreground mt-1" data-testid={`step-organization-${index}`}>
              By: {record.user.organizationName}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
