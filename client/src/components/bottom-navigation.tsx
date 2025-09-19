import { Link } from "wouter";
import { Leaf, Truck, ShoppingCart, User } from "lucide-react";

interface BottomNavigationProps {
  currentPath: string;
}

export default function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const navItems = [
    { path: "/farmer", icon: Leaf, label: "Farmer" },
    { path: "/distributor", icon: Truck, label: "Distributor" },
    { path: "/consumer", icon: ShoppingCart, label: "Consumer" },
    { path: "/", icon: User, label: "Profile" },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path;
        
        return (
          <Link 
            key={item.path} 
            href={item.path} 
            className={`nav-item ${isActive ? 'active' : ''}`}
            data-testid={`nav-${item.label.toLowerCase()}`}
          >
            <Icon className="w-5 h-5 mb-1" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
