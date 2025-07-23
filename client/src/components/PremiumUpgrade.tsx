import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PremiumUpgrade() {
  const { user } = useAuth();

  // Don't show upgrade section for premium users
  if ((user as any)?.subscriptionStatus === 'active') {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-primary-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Card className="shadow-xl">
          <CardContent className="p-8 md:p-12">
            <div className="premium-badge w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center">
              <i className="fas fa-crown text-white text-2xl"></i>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Upgrade to Premium</h2>
            <p className="text-xl text-gray-600 mb-8">Unlock advanced features and remove ads for the ultimate experience</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="text-left space-y-3">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check text-green-500"></i>
                  <span className="text-gray-700">Advanced analytics & reporting</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check text-green-500"></i>
                  <span className="text-gray-700">Custom branded domains</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check text-green-500"></i>
                  <span className="text-gray-700">Bulk QR code exports</span>
                </div>
              </div>
              <div className="text-left space-y-3">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check text-green-500"></i>
                  <span className="text-gray-700">Ad-free experience</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check text-green-500"></i>
                  <span className="text-gray-700">Higher rate limits</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check text-green-500"></i>
                  <span className="text-gray-700">Priority support</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $9.99<span className="text-lg text-gray-600 font-normal">/month</span>
              </div>
              <p className="text-gray-600 mb-6">or $99/year (save 17%)</p>
              
              <Link href="/subscribe">
                <Button className="px-8 py-4 bg-gradient-to-r from-primary to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-lg">
                  <i className="fas fa-crown mr-2"></i>
                  Upgrade Now
                </Button>
              </Link>
            </div>
            
            <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <i className="fas fa-lock"></i>
                <span>Secure payment</span>
              </div>
              <div className="flex items-center space-x-1">
                <i className="fas fa-undo"></i>
                <span>Cancel anytime</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
