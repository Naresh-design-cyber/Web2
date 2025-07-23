import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useState } from "react";

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/analytics/summary"],
  });

  const { data: urls, isLoading: urlsLoading } = useQuery({
    queryKey: ["/api/urls"],
  });

  const deleteUrlMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/urls/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "URL deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/urls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to delete URL",
        variant: "destructive",
      });
    },
  });

  const generateQrMutation = useMutation({
    mutationFn: async (shortCode: string) => {
      const response = await apiRequest("POST", `/api/qr/${shortCode}`);
      return response.json();
    },
    onSuccess: (data) => {
      setQrCodeData(data.qrCode);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (summaryLoading || urlsLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Link Dashboard</h2>
          <p className="text-xl text-gray-600">Manage and track all your shortened URLs in one place</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Links</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {(summary as any)?.totalLinks || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-link text-primary"></i>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-green-500 text-sm font-medium">Active</span>
                <span className="text-gray-500 text-sm ml-2">all time</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {(summary as any)?.totalClicks || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-mouse-pointer text-green-600"></i>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-green-500 text-sm font-medium">+{(summary as any)?.clicksThisMonth || 0}</span>
                <span className="text-gray-500 text-sm ml-2">this month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Clicks</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {(summary as any)?.totalLinks > 0 ? Math.round((summary as any).totalClicks / (summary as any).totalLinks) : 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-chart-line text-purple-600"></i>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-blue-500 text-sm font-medium">Per link</span>
                <span className="text-gray-500 text-sm ml-2">average</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Performing</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {(urls as any)?.length > 0 ? Math.max(...(urls as any).map((url: any) => url.clicks)) : 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-trophy text-amber-600"></i>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-green-500 text-sm font-medium">Best link</span>
                <span className="text-gray-500 text-sm ml-2">clicks</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Links Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Links</CardTitle>
              <Button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-primary hover:bg-primary/90"
              >
                <i className="fas fa-plus mr-2"></i>
                Create New
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {(urls as any)?.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-link text-gray-400 text-4xl mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No URLs yet</h3>
                <p className="text-gray-600 mb-4">Create your first shortened URL to get started</p>
                <Button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="bg-primary hover:bg-primary/90"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Create Your First URL
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Original URL</TableHead>
                    <TableHead>Short URL</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(urls as any)?.map((url: any) => (
                    <TableRow key={url.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="text-sm text-gray-900 truncate max-w-xs" title={url.originalUrl}>
                          {url.originalUrl}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-primary font-medium">{url.shortenedUrl}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(url.shortenedUrl)}
                            className="h-6 w-6 p-0"
                          >
                            <i className="fas fa-copy text-xs"></i>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900">{url.clicks}</span>
                          {url.clicks > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              Active
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(url.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateQrMutation.mutate(url.shortCode)}
                            disabled={generateQrMutation.isPending}
                          >
                            <i className="fas fa-qrcode"></i>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <i className="fas fa-trash"></i>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete URL</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this URL? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUrlMutation.mutate(url.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* QR Code Modal */}
        {qrCodeData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-sm mx-4">
              <CardHeader>
                <CardTitle className="text-center">QR Code</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <img src={qrCodeData} alt="QR Code" className="mx-auto mb-4" />
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.download = 'qr-code.png';
                      link.href = qrCodeData;
                      link.click();
                    }}
                    className="flex-1"
                  >
                    <i className="fas fa-download mr-2"></i>
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setQrCodeData(null)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
