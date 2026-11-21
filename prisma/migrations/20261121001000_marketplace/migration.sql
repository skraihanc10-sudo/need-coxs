-- CreateTable
CREATE TABLE "ServiceArea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "lat" REAL NOT NULL DEFAULT 21.427,
    "lng" REAL NOT NULL DEFAULT 91.98,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "blurb" TEXT NOT NULL DEFAULT '',
    "blurbBn" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'spark',
    "cover" TEXT NOT NULL DEFAULT '',
    "commissionRate" REAL NOT NULL DEFAULT 12,
    "laundry" BOOLEAN NOT NULL DEFAULT false,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "ServiceOffering" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "detail" TEXT NOT NULL DEFAULT '',
    "detailBn" TEXT NOT NULL DEFAULT '',
    "pricing" TEXT NOT NULL DEFAULT 'FIXED',
    "price" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'visit',
    "unitBn" TEXT NOT NULL DEFAULT 'ভিজিট',
    "bulk" BOOLEAN NOT NULL DEFAULT false,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ServiceOffering_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProviderCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "ProviderCategory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProviderCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProviderArea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    CONSTRAINT "ProviderArea_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProviderArea_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "ServiceArea" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProviderDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "ProviderDocument_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "areaId" TEXT,
    "addressLine" TEXT NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "visitDate" TEXT NOT NULL,
    "visitSlot" TEXT NOT NULL,
    "endDate" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "photos" TEXT NOT NULL DEFAULT '',
    "pricing" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "quoteAmount" INTEGER,
    "rooms" INTEGER NOT NULL DEFAULT 0,
    "teamSize" INTEGER NOT NULL DEFAULT 1,
    "days" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "commissionRate" REAL NOT NULL DEFAULT 0,
    "commissionAmt" INTEGER NOT NULL DEFAULT 0,
    "providerEarning" INTEGER NOT NULL DEFAULT 0,
    "workerId" TEXT,
    "cancelReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceBooking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServiceBooking_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServiceBooking_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServiceBooking_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "ServiceOffering" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServiceBooking_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "ServiceArea" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ServiceBooking_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "DeliveryProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceBookingEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "actorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServiceBookingEvent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "ServiceBooking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ServiceBookingEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServiceReview_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "ServiceBooking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ServiceReview_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServiceReview_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DeliveryProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "storeId" TEXT,
    "vehicle" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "trade" TEXT NOT NULL DEFAULT 'RIDER',
    "available" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "DeliveryProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DeliveryProfile_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DeliveryProfile" ("available", "id", "storeId", "userId", "vehicle", "zone") SELECT "available", "id", "storeId", "userId", "vehicle", "zone" FROM "DeliveryProfile";
DROP TABLE "DeliveryProfile";
ALTER TABLE "new_DeliveryProfile" RENAME TO "DeliveryProfile";
CREATE UNIQUE INDEX "DeliveryProfile_userId_key" ON "DeliveryProfile"("userId");
CREATE TABLE "new_Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT NOT NULL DEFAULT '',
    "about" TEXT NOT NULL DEFAULT '',
    "area" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Dhaka',
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "phone" TEXT NOT NULL,
    "hue" INTEGER NOT NULL DEFAULT 210,
    "cover" TEXT NOT NULL DEFAULT '',
    "logo" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "commissionRate" REAL NOT NULL DEFAULT 12,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "openTime" TEXT NOT NULL DEFAULT '08:00',
    "closeTime" TEXT NOT NULL DEFAULT '21:00',
    "deliveryFee" INTEGER NOT NULL DEFAULT 60,
    "minOrder" INTEGER NOT NULL DEFAULT 150,
    "listing" TEXT NOT NULL DEFAULT 'LAUNDRY',
    "providerType" TEXT NOT NULL DEFAULT 'COMPANY',
    "teamSize" INTEGER NOT NULL DEFAULT 1,
    "nid" TEXT NOT NULL DEFAULT '',
    "tradeLicense" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Store_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Store" ("about", "address", "area", "city", "closeTime", "commissionRate", "cover", "createdAt", "deliveryFee", "hue", "id", "lat", "lng", "logo", "minOrder", "name", "openTime", "ownerId", "phone", "rating", "reviewCount", "slug", "status", "tagline") SELECT "about", "address", "area", "city", "closeTime", "commissionRate", "cover", "createdAt", "deliveryFee", "hue", "id", "lat", "lng", "logo", "minOrder", "name", "openTime", "ownerId", "phone", "rating", "reviewCount", "slug", "status", "tagline" FROM "Store";
DROP TABLE "Store";
ALTER TABLE "new_Store" RENAME TO "Store";
CREATE UNIQUE INDEX "Store_ownerId_key" ON "Store"("ownerId");
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ServiceArea_slug_key" ON "ServiceArea"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON "ServiceCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOffering_categoryId_slug_key" ON "ServiceOffering"("categoryId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderCategory_storeId_categoryId_key" ON "ProviderCategory"("storeId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderArea_storeId_areaId_key" ON "ProviderArea"("storeId", "areaId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceBooking_code_key" ON "ServiceBooking"("code");

-- CreateIndex
CREATE INDEX "ServiceBooking_customerId_idx" ON "ServiceBooking"("customerId");

-- CreateIndex
CREATE INDEX "ServiceBooking_storeId_status_idx" ON "ServiceBooking"("storeId", "status");

-- CreateIndex
CREATE INDEX "ServiceBooking_workerId_idx" ON "ServiceBooking"("workerId");

-- CreateIndex
CREATE INDEX "ServiceBooking_categoryId_idx" ON "ServiceBooking"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceReview_bookingId_key" ON "ServiceReview"("bookingId");

