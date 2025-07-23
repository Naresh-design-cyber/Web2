import {
  users,
  urls,
  analytics,
  qrCodes,
  type User,
  type UpsertUser,
  type InsertUrl,
  type Url,
  type InsertAnalytics,
  type Analytics,
  type QrCode,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPaymentInfo(
    userId: string,
    paymentCustomerId: string,
    subscriptionId: string,
  ): Promise<User>;

  // URL operations
  createUrl(url: InsertUrl): Promise<Url>;
  getUrlByShortCode(shortCode: string): Promise<Url | undefined>;
  getUrlsByUserId(userId: string): Promise<Url[]>;
  updateUrl(id: number, data: Partial<InsertUrl>): Promise<Url>;
  deleteUrl(id: number): Promise<void>;
  checkAliasAvailability(alias: string): Promise<boolean>;

  // Analytics operations
  recordClick(analytics: InsertAnalytics): Promise<Analytics>;
  getUrlAnalytics(urlId: number): Promise<Analytics[]>;
  getUserAnalyticsSummary(userId: string): Promise<any>;
  getUrlClickTrends(urlId: number, days: number): Promise<any[]>;
  getGeographicData(urlId: number): Promise<any[]>;
  getDeviceData(urlId: number): Promise<any[]>;
  getReferrerData(urlId: number): Promise<any[]>;

  // QR Code operations
  createQrCode(urlId: number, qrCodeData: string): Promise<QrCode>;
  getQrCodesByUrlId(urlId: number): Promise<QrCode[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPaymentInfo(
    userId: string,
    paymentCustomerId: string,
    subscriptionId: string,
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        paymentCustomerId,
        subscriptionId,
        subscriptionStatus: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // URL operations
  async createUrl(url: InsertUrl): Promise<Url> {
    const [newUrl] = await db.insert(urls).values(url).returning();
    return newUrl;
  }

  async getUrlByShortCode(shortCode: string): Promise<Url | undefined> {
    const [url] = await db
      .select()
      .from(urls)
      .where(and(eq(urls.shortCode, shortCode), eq(urls.isActive, true)));
    return url;
  }

  async getUrlsByUserId(userId: string): Promise<Url[]> {
    return db
      .select()
      .from(urls)
      .where(and(eq(urls.userId, userId), eq(urls.isActive, true)))
      .orderBy(desc(urls.createdAt));
  }

  async updateUrl(id: number, data: Partial<InsertUrl>): Promise<Url> {
    const [updatedUrl] = await db
      .update(urls)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(urls.id, id))
      .returning();
    return updatedUrl;
  }

  async deleteUrl(id: number): Promise<void> {
    await db.update(urls).set({ isActive: false }).where(eq(urls.id, id));
  }

  async checkAliasAvailability(alias: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(urls)
      .where(eq(urls.customAlias, alias));
    return !existing;
  }

  // Analytics operations
  async recordClick(analyticsData: InsertAnalytics): Promise<Analytics> {
    const [click] = await db
      .insert(analytics)
      .values(analyticsData)
      .returning();
    return click;
  }

  async getUrlAnalytics(urlId: number): Promise<Analytics[]> {
    return db
      .select()
      .from(analytics)
      .where(eq(analytics.urlId, urlId))
      .orderBy(desc(analytics.clickedAt));
  }

  async getUserAnalyticsSummary(userId: string): Promise<any> {
    const userUrls = await db
      .select({ id: urls.id })
      .from(urls)
      .where(eq(urls.userId, userId));

    const urlIds = userUrls.map((url) => url.id);

    if (urlIds.length === 0) {
      return {
        totalLinks: 0,
        totalClicks: 0,
        clicksThisMonth: 0,
        topPerforming: 0,
      };
    }

    const [totalClicks] = await db
      .select({ count: sql<number>`count(*)` })
      .from(analytics)
      .where(sql`${analytics.urlId} = ANY(${urlIds})`);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [clicksThisMonth] = await db
      .select({ count: sql<number>`count(*)` })
      .from(analytics)
      .where(
        and(
          sql`${analytics.urlId} = ANY(${urlIds})`,
          gte(analytics.clickedAt, thirtyDaysAgo),
        ),
      );

    return {
      totalLinks: userUrls.length,
      totalClicks: totalClicks.count || 0,
      clicksThisMonth: clicksThisMonth.count || 0,
      topPerforming: 0, // Will be calculated from individual URL stats
    };
  }

  async getUrlClickTrends(urlId: number, days: number): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await db
      .select({
        date: sql<string>`DATE(${analytics.clickedAt})`,
        clicks: sql<number>`count(*)`,
      })
      .from(analytics)
      .where(
        and(eq(analytics.urlId, urlId), gte(analytics.clickedAt, startDate)),
      )
      .groupBy(sql`DATE(${analytics.clickedAt})`)
      .orderBy(sql`DATE(${analytics.clickedAt})`);

    return trends;
  }

  async getGeographicData(urlId: number): Promise<any[]> {
    const geoData = await db
      .select({
        country: analytics.country,
        clicks: sql<number>`count(*)`,
      })
      .from(analytics)
      .where(eq(analytics.urlId, urlId))
      .groupBy(analytics.country)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    return geoData;
  }

  async getDeviceData(urlId: number): Promise<any[]> {
    const deviceData = await db
      .select({
        device: analytics.device,
        clicks: sql<number>`count(*)`,
      })
      .from(analytics)
      .where(eq(analytics.urlId, urlId))
      .groupBy(analytics.device)
      .orderBy(sql`count(*) DESC`);

    return deviceData;
  }

  async getReferrerData(urlId: number): Promise<any[]> {
    const referrerData = await db
      .select({
        referer: analytics.referer,
        clicks: sql<number>`count(*)`,
      })
      .from(analytics)
      .where(eq(analytics.urlId, urlId))
      .groupBy(analytics.referer)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    return referrerData;
  }

  // QR Code operations
  async createQrCode(urlId: number, qrCodeData: string): Promise<QrCode> {
    const [qrCode] = await db
      .insert(qrCodes)
      .values({ urlId, qrCodeData })
      .returning();
    return qrCode;
  }

  async getQrCodesByUrlId(urlId: number): Promise<QrCode[]> {
    return db.select().from(qrCodes).where(eq(qrCodes.urlId, urlId));
  }
}

export const storage = new DatabaseStorage();
