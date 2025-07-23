import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();

  const isPremium = (user as any)?.subscriptionStatus === 'active';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-500 rounded-lg flex items-center justify-center">
                <i className="fas fa-link text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold text-gray-900">Link Shot</span>
              {isPremium && (
                <Badge className="bg-primary-100 text-primary-700 hover:bg-primary-100">
                  PRO
                </Badge>
              )}
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <span className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">Dashboard</span>
            </Link>
            {isAuthenticated && (
              <Link href="/analytics">
                <span className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">Analytics</span>
              </Link>
            )}
            <span className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">Features</span>
            <span className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">Pricing</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {isPremium && (
                  <div className="flex items-center space-x-2 bg-amber-50 px-3 py-1 rounded-full">
                    <span className="premium-badge w-2 h-2 rounded-full"></span>
                    <span className="text-amber-700 text-sm font-medium">Premium</span>
                  </div>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={(user as any)?.profileImageUrl} alt={(user as any)?.email} />
                        <AvatarFallback>
                          {(user as any)?.firstName?.[0] || (user as any)?.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">
                        {(user as any)?.firstName || (user as any)?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {(user as any)?.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <Link href="/analytics">
                      <DropdownMenuItem className="cursor-pointer">
                        <i className="fas fa-chart-line mr-2"></i>
                        Analytics
                      </DropdownMenuItem>
                    </Link>
                    {!isPremium && (
                      <Link href="/subscribe">
                        <DropdownMenuItem className="cursor-pointer">
                          <i className="fas fa-crown mr-2"></i>
                          Upgrade to Premium
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => window.location.href = '/api/logout'}
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary hover:bg-primary/90"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
