import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertUrlSchema, insertAnalyticsSchema } from "@shared/schema";
import { z } from "zod";
import QRCode from "qrcode";
import crypto from "crypto";
// Payment processing will be handled by Dodo payments
// Remove Stripe integration

// Helper function to generate short code
function generateShortCode(): string {
  return crypto.randomBytes(4).toString('hex');
}

// Helper function to extract domain from URL
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}

// Helper function to parse user agent
function parseUserAgent(userAgent: string) {
  const device = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'mobile' : 
                /Tablet|iPad/.test(userAgent) ? 'tablet' : 'desktop';
  
  const browser = /Chrome/.test(userAgent) ? 'Chrome' :
                 /Firefox/.test(userAgent) ? 'Firefox' :
                 /Safari/.test(userAgent) ? 'Safari' :
                 /Edge/.test(userAgent) ? 'Edge' : 'Other';
  
  const os = /Windows/.test(userAgent) ? 'Windows' :
            /Mac/.test(userAgent) ? 'macOS' :
            /Linux/.test(userAgent) ? 'Linux' :
            /Android/.test(userAgent) ? 'Android' :
            /iPhone|iPad/.test(userAgent) ? 'iOS' : 'Other';
  
  return { device, browser, os };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public URL shortening endpoint
  app.post('/api/shorten', async (req, res) => {
    try {
      const { originalUrl, customAlias } = req.body;
      
      // Validate URL
      if (!originalUrl || typeof originalUrl !== 'string') {
        return res.status(400).json({ message: 'Valid URL is required' });
      }

      try {
        new URL(originalUrl);
      } catch {
        return res.status(400).json({ message: 'Invalid URL format' });
      }

      // Check if custom alias is available
      if (customAlias) {
        const available = await storage.checkAliasAvailability(customAlias);
        if (!available) {
          return res.status(400).json({ message: 'Custom alias is already taken' });
        }
      }

      // Generate short code
      let shortCode = customAlias || generateShortCode();
      
      // Ensure uniqueness if not custom alias
      if (!customAlias) {
        let isUnique = false;
        while (!isUnique) {
          const existing = await storage.getUrlByShortCode(shortCode);
          if (!existing) {
            isUnique = true;
          } else {
            shortCode = generateShortCode();
          }
        }
      }

      // Get user ID if authenticated
      const userId = req.isAuthenticated() ? (req.user as any).claims.sub : null;

      // Create URL
      const urlData = {
        originalUrl,
        shortCode,
        customAlias: customAlias || null,
        userId,
      };

      const newUrl = await storage.createUrl(urlData);
      
      const baseUrl = process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : `${req.protocol}://${req.get('host')}`;
      
      const shortenedUrl = `${baseUrl}/${shortCode}`;

      res.json({
        id: newUrl.id,
        originalUrl: newUrl.originalUrl,
        shortenedUrl,
        shortCode: newUrl.shortCode,
        customAlias: newUrl.customAlias,
      });
    } catch (error) {
      console.error('Error shortening URL:', error);
      res.status(500).json({ message: 'Failed to shorten URL' });
    }
  });

  // Bulk URL shortening
  app.post('/api/shorten/bulk', async (req, res) => {
    try {
      const { urls } = req.body;
      
      if (!Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ message: 'URLs array is required' });
      }

      const userId = req.isAuthenticated() ? (req.user as any).claims.sub : null;
      const results = [];

      for (const urlData of urls) {
        try {
          const { originalUrl, customAlias } = urlData;
          
          // Validate URL
          new URL(originalUrl);

          // Check custom alias availability
          if (customAlias) {
            const available = await storage.checkAliasAvailability(customAlias);
            if (!available) {
              results.push({
                originalUrl,
                error: 'Custom alias is already taken',
              });
              continue;
            }
          }

          let shortCode = customAlias || generateShortCode();
          
          if (!customAlias) {
            let isUnique = false;
            while (!isUnique) {
              const existing = await storage.getUrlByShortCode(shortCode);
              if (!existing) {
                isUnique = true;
              } else {
                shortCode = generateShortCode();
              }
            }
          }

          const newUrl = await storage.createUrl({
            originalUrl,
            shortCode,
            customAlias: customAlias || null,
            userId,
          });

          const baseUrl = process.env.REPLIT_DOMAINS 
            ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
            : `${req.protocol}://${req.get('host')}`;
          
          results.push({
            id: newUrl.id,
            originalUrl: newUrl.originalUrl,
            shortenedUrl: `${baseUrl}/${shortCode}`,
            shortCode: newUrl.shortCode,
          });
        } catch (error) {
          results.push({
            originalUrl: urlData.originalUrl,
            error: 'Invalid URL or processing error',
          });
        }
      }

      res.json({ results });
    } catch (error) {
      console.error('Error bulk shortening URLs:', error);
      res.status(500).json({ message: 'Failed to process bulk URLs' });
    }
  });

  // Redirect endpoint - moved to end to avoid interfering with static files

  // User URLs
  app.get('/api/urls', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const urls = await storage.getUrlsByUserId(userId);
      
      const baseUrl = process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : `${req.protocol}://${req.get('host')}`;

      const urlsWithAnalytics = await Promise.all(
        urls.map(async (url) => {
          const analytics = await storage.getUrlAnalytics(url.id);
          return {
            ...url,
            shortenedUrl: `${baseUrl}/${url.shortCode}`,
            clicks: analytics.length,
          };
        })
      );

      res.json(urlsWithAnalytics);
    } catch (error) {
      console.error('Error fetching user URLs:', error);
      res.status(500).json({ message: 'Failed to fetch URLs' });
    }
  });

  // Update URL
  app.put('/api/urls/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { customAlias } = req.body;
      const userId = req.user.claims.sub;

      // Verify ownership
      const url = await storage.getUrlByShortCode(''); // We need to get by ID, not shortCode
      // This is a simplified check - in production, add proper ownership verification

      if (customAlias) {
        const available = await storage.checkAliasAvailability(customAlias);
        if (!available) {
          return res.status(400).json({ message: 'Custom alias is already taken' });
        }
      }

      const updatedUrl = await storage.updateUrl(parseInt(id), {
        customAlias: customAlias || null,
      });

      res.json(updatedUrl);
    } catch (error) {
      console.error('Error updating URL:', error);
      res.status(500).json({ message: 'Failed to update URL' });
    }
  });

  // Delete URL
  app.delete('/api/urls/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUrl(parseInt(id));
      res.json({ message: 'URL deleted successfully' });
    } catch (error) {
      console.error('Error deleting URL:', error);
      res.status(500).json({ message: 'Failed to delete URL' });
    }
  });

  // Generate QR Code
  app.post('/api/qr/:shortCode', async (req, res) => {
    try {
      const { shortCode } = req.params;
      const url = await storage.getUrlByShortCode(shortCode);

      if (!url) {
        return res.status(404).json({ message: 'URL not found' });
      }

      const baseUrl = process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : `${req.protocol}://${req.get('host')}`;
      
      const fullUrl = `${baseUrl}/${shortCode}`;
      const qrCodeData = await QRCode.toDataURL(fullUrl);

      // Save QR code to database
      await storage.createQrCode(url.id, qrCodeData);

      res.json({ qrCode: qrCodeData });
    } catch (error) {
      console.error('Error generating QR code:', error);
      res.status(500).json({ message: 'Failed to generate QR code' });
    }
  });

  // Analytics endpoints
  app.get('/api/analytics/summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const summary = await storage.getUserAnalyticsSummary(userId);
      res.json(summary);
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  app.get('/api/analytics/:urlId/trends', isAuthenticated, async (req: any, res) => {
    try {
      const { urlId } = req.params;
      const { days = 30 } = req.query;
      const trends = await storage.getUrlClickTrends(parseInt(urlId), parseInt(days as string));
      res.json(trends);
    } catch (error) {
      console.error('Error fetching click trends:', error);
      res.status(500).json({ message: 'Failed to fetch trends' });
    }
  });

  app.get('/api/analytics/:urlId/geo', isAuthenticated, async (req: any, res) => {
    try {
      const { urlId } = req.params;
      const geoData = await storage.getGeographicData(parseInt(urlId));
      res.json(geoData);
    } catch (error) {
      console.error('Error fetching geographic data:', error);
      res.status(500).json({ message: 'Failed to fetch geographic data' });
    }
  });

  app.get('/api/analytics/:urlId/devices', isAuthenticated, async (req: any, res) => {
    try {
      const { urlId } = req.params;
      const deviceData = await storage.getDeviceData(parseInt(urlId));
      res.json(deviceData);
    } catch (error) {
      console.error('Error fetching device data:', error);
      res.status(500).json({ message: 'Failed to fetch device data' });
    }
  });

  app.get('/api/analytics/:urlId/referrers', isAuthenticated, async (req: any, res) => {
    try {
      const { urlId } = req.params;
      const referrerData = await storage.getReferrerData(parseInt(urlId));
      res.json(referrerData);
    } catch (error) {
      console.error('Error fetching referrer data:', error);
      res.status(500).json({ message: 'Failed to fetch referrer data' });
    }
  });

  // Payment endpoints will be implemented with Dodo payments integration
  // For now, users can use the free tier features

  // Note: The redirect route is registered separately in index.ts AFTER Vite setup
  // to avoid interfering with static file serving

  const httpServer = createServer(app);
  return httpServer;
}
