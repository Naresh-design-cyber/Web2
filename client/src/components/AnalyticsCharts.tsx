import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function AnalyticsCharts() {
  const { user } = useAuth();
  const isPremium = (user as any)?.subscriptionStatus === 'active';

  const { data: summary } = useQuery({
    queryKey: ["/api/analytics/summary"],
  });

  if (!isPremium) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Advanced Analytics</h2>
            <p className="text-xl text-gray-600">Upgrade to Premium for detailed insights</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-10">
                <div className="text-center">
                  <i className="fas fa-lock text-gray-400 text-3xl mb-2"></i>
                  <p className="text-gray-600 font-medium">Premium Feature</p>
                </div>
              </div>
              <CardHeader>
                <CardTitle>Click Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Chart Preview</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-10">
                <div className="text-center">
                  <i className="fas fa-lock text-gray-400 text-3xl mb-2"></i>
                  <p className="text-gray-600 font-medium">Premium Feature</p>
                </div>
              </div>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Map Preview</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Advanced Analytics</h2>
          <p className="text-xl text-gray-600">Deep insights into your link performance</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg">
                  <div>
                    <p className="text-sm text-primary-600 font-medium">Total Links Created</p>
                    <p className="text-2xl font-bold text-primary-700">{(summary as any)?.totalLinks || 0}</p>
                  </div>
                  <i className="fas fa-link text-primary-500 text-2xl"></i>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total Clicks</p>
                    <p className="text-2xl font-bold text-green-700">{(summary as any)?.totalClicks || 0}</p>
                  </div>
                  <i className="fas fa-mouse-pointer text-green-500 text-2xl"></i>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">This Month</p>
                    <p className="text-2xl font-bold text-purple-700">{(summary as any)?.clicksThisMonth || 0}</p>
                  </div>
                  <i className="fas fa-calendar text-purple-500 text-2xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Premium Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <i className="fas fa-chart-line text-primary text-4xl mb-4"></i>
                <p className="text-gray-600 mb-4">
                  Access detailed analytics including geographic data, device breakdown, 
                  referrer tracking, and time-series analysis.
                </p>
                <a 
                  href="/analytics" 
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <i className="fas fa-arrow-right mr-2"></i>
                  View Detailed Analytics
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
