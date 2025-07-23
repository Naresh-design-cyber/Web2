import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Analytics() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedUrl, setSelectedUrl] = useState<string>("");

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
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: urls } = useQuery({
    queryKey: ["/api/urls"],
    enabled: isAuthenticated,
  });

  const { data: trends } = useQuery({
    queryKey: ["/api/analytics", selectedUrl, "trends"],
    enabled: !!selectedUrl,
  });

  const { data: geoData } = useQuery({
    queryKey: ["/api/analytics", selectedUrl, "geo"],
    enabled: !!selectedUrl,
  });

  const { data: deviceData } = useQuery({
    queryKey: ["/api/analytics", selectedUrl, "devices"],
    enabled: !!selectedUrl,
  });

  const { data: referrerData } = useQuery({
    queryKey: ["/api/analytics", selectedUrl, "referrers"],
    enabled: !!selectedUrl,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Advanced Analytics</h1>
          <p className="text-xl text-gray-600">Deep insights into your link performance</p>
        </div>

        {/* URL Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select URL for Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedUrl} onValueChange={setSelectedUrl}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose a URL to analyze" />
              </SelectTrigger>
              <SelectContent>
                {(urls as any)?.map((url: any) => (
                  <SelectItem key={url.id} value={url.id.toString()}>
                    {url.shortenedUrl} ({url.clicks} clicks)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedUrl && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="geographic">Geographic</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="referrers">Referrers</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Click Trends (Last 30 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center">
                      {(trends as any)?.length > 0 ? (
                        <div className="text-center">
                          <p className="text-2xl font-bold">{(trends as any).reduce((sum: number, day: any) => sum + day.clicks, 0)}</p>
                          <p className="text-gray-600">Total clicks in period</p>
                        </div>
                      ) : (
                        <p className="text-gray-500">No data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Clicks</span>
                        <span className="font-semibold">{(trends as any)?.reduce((sum: number, day: any) => sum + day.clicks, 0) || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Countries</span>
                        <span className="font-semibold">{(geoData as any)?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Device Types</span>
                        <span className="font-semibold">{(deviceData as any)?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Referrer Sources</span>
                        <span className="font-semibold">{(referrerData as any)?.length || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="geographic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(geoData as any)?.map((country: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-4 bg-blue-500 rounded-sm flex-shrink-0"></div>
                          <span className="text-sm text-gray-900">{country.country || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, (country.clicks / Math.max(...(geoData as any).map((g: any) => g.clicks))) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{country.clicks}</span>
                        </div>
                      </div>
                    ))}
                    {!(geoData as any)?.length && (
                      <p className="text-gray-500 text-center py-8">No geographic data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="devices" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Device Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(deviceData as any)?.map((device: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <i className={`fas fa-${device.device === 'mobile' ? 'mobile-alt' : device.device === 'tablet' ? 'tablet-alt' : 'desktop'} text-blue-500 text-sm`}></i>
                          </div>
                          <span className="text-sm font-medium text-gray-900 capitalize">{device.device || 'Unknown'}</span>
                        </div>
                        <span className="text-sm text-gray-600">{device.clicks} clicks</span>
                      </div>
                    ))}
                    {!(deviceData as any)?.length && (
                      <p className="text-gray-500 text-center py-8">No device data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referrers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Referrers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(referrerData as any)?.map((referrer: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-external-link-alt text-blue-500 text-sm"></i>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {referrer.referer ? new URL(referrer.referer).hostname : 'Direct'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{referrer.clicks} clicks</span>
                      </div>
                    ))}
                    {!(referrerData as any)?.length && (
                      <p className="text-gray-500 text-center py-8">No referrer data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
