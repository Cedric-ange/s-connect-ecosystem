-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'GPS', 'PHOTO');

-- CreateEnum
CREATE TYPE "FormPurpose" AS ENUM ('SALES_ORDER', 'STOCK_AUDIT', 'ASSET_CHECK', 'GENERIC_SURVEY');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'REP',
    "phone" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "photoUrl" TEXT,
    "hireDate" TIMESTAMP(3),
    "adminId" TEXT,
    "territoryId" TEXT,
    "assignedSectorId" TEXT,
    "managerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "territories" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'SECTEUR',
    "parentId" TEXT,
    "adminId" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "regions" TEXT,
    "communes" TEXT,
    "villes" TEXT,
    "quartiers" TEXT,
    "codesPostaux" TEXT,
    "population" INTEGER,
    "superficie" DOUBLE PRECISION,
    "densitePopulation" DOUBLE PRECISION,
    "potentielCommercial" TEXT,
    "categorieMarche" TEXT,
    "typeZone" TEXT,
    "nombrePDVEstime" INTEGER,
    "tauxPenetration" DOUBLE PRECISION,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "territories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outlets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "segment" TEXT,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION NOT NULL,
    "openHours" TEXT,
    "territoryId" TEXT NOT NULL,
    "sectorId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "proposedBy" TEXT,
    "validatedBy" TEXT,
    "validatedAt" TIMESTAMP(3),
    "validationComment" TEXT,
    "osmPlaceId" TEXT,
    "osmMetadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parent_id" TEXT,

    CONSTRAINT "outlets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_sub_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_sub_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "subProductCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_pack_formats" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pack_formats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skus" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "ean" TEXT NOT NULL,
    "code" TEXT,
    "packFormatId" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    "photo" TEXT,
    "priceHt" DOUBLE PRECISION NOT NULL,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 19.6,
    "base_unit" TEXT NOT NULL DEFAULT 'UNIT',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_packagings" (
    "id" TEXT NOT NULL,
    "sku_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "conversion_factor" INTEGER NOT NULL,

    CONSTRAINT "product_packagings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visitId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalHt" DOUBLE PRECISION NOT NULL,
    "totalTtc" DOUBLE PRECISION NOT NULL,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 19.6,
    "currency" TEXT DEFAULT 'XOF',
    "taxTotal" DOUBLE PRECISION DEFAULT 0,
    "discountTotal" DOUBLE PRECISION DEFAULT 0,
    "paymentMethod" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_lines" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceHt" DOUBLE PRECISION NOT NULL,
    "totalPriceHt" DOUBLE PRECISION NOT NULL,
    "totalPriceTtc" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "checkinAt" TIMESTAMP(3),
    "checkinLat" DOUBLE PRECISION,
    "checkinLng" DOUBLE PRECISION,
    "checkoutAt" TIMESTAMP(3),
    "checkoutLat" DOUBLE PRECISION,
    "checkoutLng" DOUBLE PRECISION,
    "durationMin" INTEGER,
    "score" INTEGER,
    "notes" TEXT,
    "plannedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merch_checks" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER,
    "notes" TEXT,
    "merchPhotos" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merch_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merch_check_items" (
    "id" TEXT NOT NULL,
    "merchCheckId" TEXT NOT NULL,
    "merchandisingCheckId" TEXT,
    "skuId" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "isPriceCorrect" BOOLEAN NOT NULL DEFAULT false,
    "isWellStocked" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merch_check_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merch_photos" (
    "id" TEXT NOT NULL,
    "merchCheckId" TEXT NOT NULL,
    "merchandisingCheckId" TEXT,
    "fileKey" TEXT NOT NULL,
    "imageUrl" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merch_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_stocks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "alertThreshold" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_histories" (
    "id" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "movementType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "beforeQty" INTEGER NOT NULL,
    "afterQty" INTEGER NOT NULL,
    "notes" TEXT,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dynamic_forms" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "purpose" "FormPurpose" NOT NULL DEFAULT 'GENERIC_SURVEY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dynamic_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_fields" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "FieldType" NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "form_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'document',
    "contentUrl" TEXT NOT NULL,
    "duration" INTEGER,
    "targetRoles" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "badge" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentUrl" TEXT NOT NULL,
    "duration" INTEGER,
    "quiz" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "questions" TEXT NOT NULL,
    "passingScore" DOUBLE PRECISION NOT NULL,
    "timeLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_assessments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answers" TEXT NOT NULL,
    "timeTaken" INTEGER NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_points" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_levels" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_levels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_matricule_key" ON "users"("matricule");

-- CreateIndex
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_territoryId_idx" ON "users"("territoryId");

-- CreateIndex
CREATE INDEX "users_assignedSectorId_idx" ON "users"("assignedSectorId");

-- CreateIndex
CREATE INDEX "users_managerId_idx" ON "users"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "territories_code_key" ON "territories"("code");

-- CreateIndex
CREATE INDEX "territories_tenant_id_idx" ON "territories"("tenant_id");

-- CreateIndex
CREATE INDEX "territories_code_idx" ON "territories"("code");

-- CreateIndex
CREATE INDEX "territories_level_idx" ON "territories"("level");

-- CreateIndex
CREATE INDEX "territories_parentId_idx" ON "territories"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "outlets_code_key" ON "outlets"("code");

-- CreateIndex
CREATE INDEX "outlets_tenant_id_idx" ON "outlets"("tenant_id");

-- CreateIndex
CREATE INDEX "outlets_code_idx" ON "outlets"("code");

-- CreateIndex
CREATE INDEX "outlets_territoryId_idx" ON "outlets"("territoryId");

-- CreateIndex
CREATE INDEX "outlets_sectorId_idx" ON "outlets"("sectorId");

-- CreateIndex
CREATE INDEX "outlets_status_idx" ON "outlets"("status");

-- CreateIndex
CREATE INDEX "outlets_proposedBy_idx" ON "outlets"("proposedBy");

-- CreateIndex
CREATE INDEX "outlets_parent_id_idx" ON "outlets"("parent_id");

-- CreateIndex
CREATE INDEX "product_categories_tenant_id_idx" ON "product_categories"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_tenant_id_name_key" ON "product_categories"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "product_sub_categories_categoryId_idx" ON "product_sub_categories"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "product_sub_categories_categoryId_name_key" ON "product_sub_categories"("categoryId", "name");

-- CreateIndex
CREATE INDEX "product_brands_subProductCategoryId_idx" ON "product_brands"("subProductCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "product_brands_subProductCategoryId_name_key" ON "product_brands"("subProductCategoryId", "name");

-- CreateIndex
CREATE INDEX "product_pack_formats_brandId_idx" ON "product_pack_formats"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "product_pack_formats_brandId_name_key" ON "product_pack_formats"("brandId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "skus_ean_key" ON "skus"("ean");

-- CreateIndex
CREATE INDEX "skus_tenant_id_idx" ON "skus"("tenant_id");

-- CreateIndex
CREATE INDEX "skus_ean_idx" ON "skus"("ean");

-- CreateIndex
CREATE INDEX "skus_code_idx" ON "skus"("code");

-- CreateIndex
CREATE INDEX "skus_packFormatId_idx" ON "skus"("packFormatId");

-- CreateIndex
CREATE INDEX "skus_active_idx" ON "skus"("active");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_tenant_id_idx" ON "orders"("tenant_id");

-- CreateIndex
CREATE INDEX "orders_orderNumber_idx" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_outletId_idx" ON "orders"("outletId");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_orderDate_idx" ON "orders"("orderDate");

-- CreateIndex
CREATE INDEX "order_lines_orderId_idx" ON "order_lines"("orderId");

-- CreateIndex
CREATE INDEX "order_lines_skuId_idx" ON "order_lines"("skuId");

-- CreateIndex
CREATE INDEX "visits_tenant_id_idx" ON "visits"("tenant_id");

-- CreateIndex
CREATE INDEX "visits_outletId_idx" ON "visits"("outletId");

-- CreateIndex
CREATE INDEX "visits_userId_idx" ON "visits"("userId");

-- CreateIndex
CREATE INDEX "visits_status_idx" ON "visits"("status");

-- CreateIndex
CREATE INDEX "visits_plannedDate_idx" ON "visits"("plannedDate");

-- CreateIndex
CREATE INDEX "merch_checks_visitId_idx" ON "merch_checks"("visitId");

-- CreateIndex
CREATE INDEX "merch_checks_userId_idx" ON "merch_checks"("userId");

-- CreateIndex
CREATE INDEX "merch_check_items_merchCheckId_idx" ON "merch_check_items"("merchCheckId");

-- CreateIndex
CREATE INDEX "merch_check_items_skuId_idx" ON "merch_check_items"("skuId");

-- CreateIndex
CREATE INDEX "merch_check_items_merchandisingCheckId_idx" ON "merch_check_items"("merchandisingCheckId");

-- CreateIndex
CREATE INDEX "merch_photos_merchCheckId_idx" ON "merch_photos"("merchCheckId");

-- CreateIndex
CREATE INDEX "merch_photos_merchandisingCheckId_idx" ON "merch_photos"("merchandisingCheckId");

-- CreateIndex
CREATE INDEX "vendor_stocks_userId_idx" ON "vendor_stocks"("userId");

-- CreateIndex
CREATE INDEX "vendor_stocks_skuId_idx" ON "vendor_stocks"("skuId");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_stocks_userId_skuId_key" ON "vendor_stocks"("userId", "skuId");

-- CreateIndex
CREATE INDEX "stock_histories_stockItemId_idx" ON "stock_histories"("stockItemId");

-- CreateIndex
CREATE INDEX "stock_histories_movementType_idx" ON "stock_histories"("movementType");

-- CreateIndex
CREATE INDEX "stock_histories_createdAt_idx" ON "stock_histories"("createdAt");

-- CreateIndex
CREATE INDEX "stock_histories_orderId_idx" ON "stock_histories"("orderId");

-- CreateIndex
CREATE INDEX "dynamic_forms_tenant_id_idx" ON "dynamic_forms"("tenant_id");

-- CreateIndex
CREATE INDEX "form_fields_form_id_idx" ON "form_fields"("form_id");

-- CreateIndex
CREATE INDEX "submissions_form_id_idx" ON "submissions"("form_id");

-- CreateIndex
CREATE INDEX "submissions_outlet_id_idx" ON "submissions"("outlet_id");

-- CreateIndex
CREATE INDEX "courses_category_idx" ON "courses"("category");

-- CreateIndex
CREATE INDEX "courses_isPublished_idx" ON "courses"("isPublished");

-- CreateIndex
CREATE INDEX "chapters_courseId_idx" ON "chapters"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_courseId_order_key" ON "chapters"("courseId", "order");

-- CreateIndex
CREATE INDEX "enrollments_userId_idx" ON "enrollments"("userId");

-- CreateIndex
CREATE INDEX "enrollments_courseId_idx" ON "enrollments"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_userId_courseId_key" ON "enrollments"("userId", "courseId");

-- CreateIndex
CREATE INDEX "assessments_courseId_idx" ON "assessments"("courseId");

-- CreateIndex
CREATE INDEX "user_assessments_userId_idx" ON "user_assessments"("userId");

-- CreateIndex
CREATE INDEX "user_assessments_assessmentId_idx" ON "user_assessments"("assessmentId");

-- CreateIndex
CREATE INDEX "user_points_userId_idx" ON "user_points"("userId");

-- CreateIndex
CREATE INDEX "user_levels_userId_idx" ON "user_levels"("userId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "territories" ADD CONSTRAINT "territories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "territories" ADD CONSTRAINT "territories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "territories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outlets" ADD CONSTRAINT "outlets_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "outlets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outlets" ADD CONSTRAINT "outlets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outlets" ADD CONSTRAINT "outlets_validatedBy_fkey" FOREIGN KEY ("validatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outlets" ADD CONSTRAINT "outlets_proposedBy_fkey" FOREIGN KEY ("proposedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outlets" ADD CONSTRAINT "outlets_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "territories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sub_categories" ADD CONSTRAINT "product_sub_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_brands" ADD CONSTRAINT "product_brands_subProductCategoryId_fkey" FOREIGN KEY ("subProductCategoryId") REFERENCES "product_sub_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_pack_formats" ADD CONSTRAINT "product_pack_formats_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "product_brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skus" ADD CONSTRAINT "skus_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skus" ADD CONSTRAINT "skus_packFormatId_fkey" FOREIGN KEY ("packFormatId") REFERENCES "product_pack_formats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_packagings" ADD CONSTRAINT "product_packagings_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "skus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "outlets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "skus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "outlets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merch_checks" ADD CONSTRAINT "merch_checks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merch_checks" ADD CONSTRAINT "merch_checks_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merch_check_items" ADD CONSTRAINT "merch_check_items_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "skus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merch_check_items" ADD CONSTRAINT "merch_check_items_merchCheckId_fkey" FOREIGN KEY ("merchCheckId") REFERENCES "merch_checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merch_photos" ADD CONSTRAINT "merch_photos_merchCheckId_fkey" FOREIGN KEY ("merchCheckId") REFERENCES "merch_checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_stocks" ADD CONSTRAINT "vendor_stocks_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "skus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_stocks" ADD CONSTRAINT "vendor_stocks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_histories" ADD CONSTRAINT "stock_histories_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_histories" ADD CONSTRAINT "stock_histories_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "vendor_stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dynamic_forms" ADD CONSTRAINT "dynamic_forms_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "dynamic_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "dynamic_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_assessments" ADD CONSTRAINT "user_assessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_points" ADD CONSTRAINT "user_points_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_levels" ADD CONSTRAINT "user_levels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
