import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ShortenResult {
  id: number;
  originalUrl: string;
  shortenedUrl: string;
  shortCode: string;
  customAlias?: string;
}

export default function HeroSection() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkUrls, setBulkUrls] = useState("");
  const [results, setResults] = useState<ShortenResult[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const shortenMutation = useMutation({
    mutationFn: async (data: { originalUrl: string; customAlias?: string }) => {
      const response = await apiRequest("POST", "/api/shorten", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResults([data]);
      setOriginalUrl("");
      setCustomAlias("");
      toast({
        title: "Success!",
        description: "URL shortened successfully",
      });
      // Invalidate user URLs if authenticated
      queryClient.invalidateQueries({ queryKey: ["/api/urls"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkShortenMutation = useMutation({
    mutationFn: async (urls: Array<{ originalUrl: string; customAlias?: string }>) => {
      const response = await apiRequest("POST", "/api/shorten/bulk", { urls });
      return response.json();
    },
    onSuccess: (data) => {
      const successfulResults = data.results.filter((r: any) => !r.error);
      setResults(successfulResults);
      setBulkUrls("");
      
      const errorCount = data.results.length - successfulResults.length;
      if (errorCount > 0) {
        toast({
          title: "Partial Success",
          description: `${successfulResults.length} URLs shortened, ${errorCount} failed`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: `${successfulResults.length} URLs shortened successfully`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/urls"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleShorten = () => {
    if (!bulkMode) {
      if (!originalUrl.trim()) {
        toast({
          title: "Error",
          description: "Please enter a URL",
          variant: "destructive",
        });
        return;
      }
      shortenMutation.mutate({ originalUrl: originalUrl.trim(), customAlias: customAlias.trim() || undefined });
    } else {
      const urls = bulkUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url)
        .map(url => ({ originalUrl: url }));
      
      if (urls.length === 0) {
        toast({
          title: "Error",
          description: "Please enter at least one URL",
          variant: "destructive",
        });
        return;
      }
      
      bulkShortenMutation.mutate(urls);
    }
  };

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

  return (
    <>
      <section className="gradient-bg relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
            Shorten URLs,<br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Amplify Results
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto animate-fade-in">
            Professional URL shortening with powerful analytics, custom branding, and enterprise-grade reliability.
          </p>

          <div className="glass-effect rounded-2xl p-8 max-w-3xl mx-auto animate-slide-up">
            {!bulkMode ? (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="floating-label flex-1">
                  <Input
                    type="url"
                    id="urlInput"
                    placeholder=" "
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-white/90 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                  <Label
                    htmlFor="urlInput"
                    className="bg-white/90 px-2 rounded"
                  >
                    Enter your long URL here
                  </Label>
                </div>
                
                <div className="floating-label md:w-48">
                  <Input
                    type="text"
                    id="aliasInput"
                    placeholder=" "
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    className="w-full px-4 py-3 bg-white/90 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                  <Label
                    htmlFor="aliasInput"
                    className="bg-white/90 px-2 rounded"
                  >
                    Custom alias (optional)
                  </Label>
                </div>
                
                <Button
                  onClick={handleShorten}
                  disabled={shortenMutation.isPending}
                  className="px-8 py-3 bg-gradient-to-r from-primary to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {shortenMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Shortening...</span>
                    </div>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-2"></i>
                      Shorten
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="floating-label">
                  <Textarea
                    id="bulkUrls"
                    placeholder=" "
                    value={bulkUrls}
                    onChange={(e) => setBulkUrls(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-white/90 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                  />
                  <Label
                    htmlFor="bulkUrls"
                    className="bg-white/90 px-2 rounded"
                  >
                    Enter URLs (one per line)
                  </Label>
                </div>
                
                <Button
                  onClick={handleShorten}
                  disabled={bulkShortenMutation.isPending}
                  className="w-full px-8 py-3 bg-gradient-to-r from-primary to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {bulkShortenMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Processing URLs...</span>
                    </div>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-2"></i>
                      Shorten All URLs
                    </>
                  )}
                </Button>
              </div>
            )}
            
            <div className="mt-4 flex items-center justify-center">
              <button
                onClick={() => setBulkMode(!bulkMode)}
                className="text-white/80 hover:text-white text-sm flex items-center space-x-2 transition-colors"
              >
                <i className={`fas fa-${bulkMode ? 'link' : 'list'}`}></i>
                <span>{bulkMode ? 'Single URL' : 'Bulk URL Shortening'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {results.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-green-50 border border-green-200 animate-slide-up">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <i className="fas fa-check text-green-600"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {results.length === 1 ? 'URL Successfully Shortened!' : `${results.length} URLs Successfully Shortened!`}
                    </h3>
                    <p className="text-gray-600">Your links are ready to share</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {results.map((result, index) => (
                    <div key={index} className="space-y-4">
                      {results.length > 1 && (
                        <h4 className="font-medium text-gray-900">URL #{index + 1}</h4>
                      )}
                      
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">Original URL</Label>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <span className="text-gray-800 text-sm break-all">
                            {result.originalUrl}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">Shortened URL</Label>
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary-50 rounded-lg p-3 border border-primary-200 flex-1">
                            <span className="text-primary-700 font-medium">
                              {result.shortenedUrl}
                            </span>
                          </div>
                          <Button
                            onClick={() => copyToClipboard(result.shortenedUrl)}
                            className="px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-200 flex items-center space-x-2"
                          >
                            <i className="fas fa-copy"></i>
                            <span>Copy</span>
                          </Button>
                        </div>
                      </div>
                      
                      {index < results.length - 1 && <div className="border-t border-gray-200 pt-4"></div>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </>
  );
}
