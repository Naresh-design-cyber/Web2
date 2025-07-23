import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function AdBanner() {
  const { user } = useAuth();

  // Don't show ads for premium users
  if ((user as any)?.subscriptionStatus === 'active') {
    return null;
  }

  return (
    <section className="py-6 bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-gray-500 mb-2">Advertisement</div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-gray-200">
              <div className="text-gray-600">
                {/* Google AdSense ad unit would be placed here */}
                <div className="h-24 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                  <span className="text-gray-500 text-sm">Google AdSense Banner (728x90)</span>
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <span>Want an ad-free experience? </span>
              <Link href="/subscribe">
                <span className="text-primary hover:text-primary/80 font-medium cursor-pointer">
                  Upgrade to Premium
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
