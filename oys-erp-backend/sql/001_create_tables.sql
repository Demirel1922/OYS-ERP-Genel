-- ============================================================
-- OYS ERP - Microsoft SQL Server Veritabanı Oluşturma Script'i
-- ============================================================
-- Bağlantı: 10.10.1.5 / sarper / 123
-- SSMS'de çalıştır (F5)
-- ============================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'OYS_ERP')
BEGIN
    CREATE DATABASE OYS_ERP;
END
GO

USE OYS_ERP;
GO

-- ============================================================
-- 1) KULLANICILAR
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
CREATE TABLE Users (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    username        NVARCHAR(100)   NOT NULL UNIQUE,
    password_hash   NVARCHAR(200)   NOT NULL,
    full_name       NVARCHAR(200)   NOT NULL,
    email           NVARCHAR(200)   NULL,
    is_admin        BIT             NOT NULL DEFAULT 0,
    modules         NVARCHAR(MAX)   NULL,  -- JSON array: ["1","1a","4","4a"]
    is_active       BIT             NOT NULL DEFAULT 1,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO

-- Varsayılan admin kullanıcı
IF NOT EXISTS (SELECT 1 FROM Users WHERE username = 'admin')
INSERT INTO Users (username, password_hash, full_name, is_admin, modules)
VALUES ('admin', 'admin123', 'Admin User', 1, '[]');
GO

IF NOT EXISTS (SELECT 1 FROM Users WHERE username = 'user')
INSERT INTO Users (username, password_hash, full_name, is_admin, modules)
VALUES ('user', 'user123', 'Normal User', 0, '["1","1a","1b","1c","1d","1e","4","4a"]');
GO

-- ============================================================
-- 2) MÜŞTERİLER
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Customers')
CREATE TABLE Customers (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    ormeci_musteri_no   NVARCHAR(50)    NOT NULL,
    musteri_kisa_kod    NVARCHAR(50)    NOT NULL,
    musteri_unvan       NVARCHAR(300)   NOT NULL,
    bolge               NVARCHAR(20)    NOT NULL DEFAULT 'IHRACAT',  -- IHRACAT | IC_PIYASA
    ulke                NVARCHAR(100)   NOT NULL DEFAULT 'Türkiye',
    adres               NVARCHAR(500)   NULL,
    vergi_no            NVARCHAR(50)    NULL,
    odeme_vadesi_deger  INT             NOT NULL DEFAULT 30,
    odeme_vadesi_birim  NVARCHAR(10)    NOT NULL DEFAULT 'GUN',      -- GUN | AY
    odeme_tipi          NVARCHAR(100)   NULL,
    durum               NVARCHAR(10)    NOT NULL DEFAULT 'AKTIF',    -- AKTIF | PASIF
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 3) TEDARİKÇİ KATEGORİLERİ
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SupplierCategories')
CREATE TABLE SupplierCategories (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    kategori_kodu   NVARCHAR(50)    NULL,
    kategori_adi    NVARCHAR(200)   NOT NULL,
    aciklama        NVARCHAR(500)   NULL,
    durum           NVARCHAR(10)    NOT NULL DEFAULT 'AKTIF',
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 4) TEDARİKÇİLER
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Suppliers')
CREATE TABLE Suppliers (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    tedarikci_kodu      NVARCHAR(50)    NOT NULL,
    tedarikci_adi       NVARCHAR(300)   NOT NULL,
    tedarikci_unvan     NVARCHAR(300)   NULL,
    bolge               NVARCHAR(20)    NOT NULL DEFAULT 'ITHALAT',  -- ITHALAT | IC_PIYASA
    ulke                NVARCHAR(100)   NULL,
    adres               NVARCHAR(500)   NULL,
    vkn                 NVARCHAR(50)    NULL,
    vergi_dairesi       NVARCHAR(200)   NULL,
    durum               NVARCHAR(10)    NOT NULL DEFAULT 'AKTIF',
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO

-- Tedarikçi-Kategori ilişki tablosu (çoktan çoğa)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SupplierCategoryMap')
CREATE TABLE SupplierCategoryMap (
    supplier_id     INT NOT NULL,
    category_id     INT NOT NULL,
    PRIMARY KEY (supplier_id, category_id),
    CONSTRAINT FK_SCM_Supplier FOREIGN KEY (supplier_id) REFERENCES Suppliers(id) ON DELETE CASCADE,
    CONSTRAINT FK_SCM_Category FOREIGN KEY (category_id) REFERENCES SupplierCategories(id) ON DELETE CASCADE
);
GO

-- ============================================================
-- 5) DEPOLAR
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Warehouses')
CREATE TABLE Warehouses (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    depo_adi                NVARCHAR(200)   NOT NULL,
    depo_kodu               INT             NOT NULL,
    depo_tipi               NVARCHAR(20)    NOT NULL DEFAULT 'IC_DEPO', -- IC_DEPO | DIS_DEPO
    dis_depo_adres          NVARCHAR(500)   NULL,
    dis_depo_vkn            NVARCHAR(50)    NULL,
    dis_depo_vergi_dairesi  NVARCHAR(200)   NULL,
    durum                   NVARCHAR(10)    NOT NULL DEFAULT 'AKTIF',
    created_at              DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at              DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 6) LOOKUP (Beden, Tip, Cinsiyet, Birim)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LookupItems')
CREATE TABLE LookupItems (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    lookup_type     NVARCHAR(20)    NOT NULL,  -- BEDEN | TIP | CINSIYET | BIRIM
    kod             NVARCHAR(100)   NOT NULL,
    ad              NVARCHAR(200)   NOT NULL,
    sira            INT             NULL,
    carpan          INT             NULL,       -- Birim çarpanı (Düzine=12, 3lü Paket=3)
    durum           NVARCHAR(10)    NOT NULL DEFAULT 'AKTIF',
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO

CREATE INDEX IX_LookupItems_Type ON LookupItems(lookup_type);
GO

-- ============================================================
-- 7) İPLİK TANIMLARI - İşlem Tipleri
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TransactionTypes')
CREATE TABLE TransactionTypes (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    islem_adi       NVARCHAR(200)   NOT NULL,
    hareket_yonu    NVARCHAR(10)    NOT NULL,   -- GIRIS | CIKIS
    aciklama        NVARCHAR(500)   NULL,
    durum           NVARCHAR(10)    NOT NULL DEFAULT 'AKTIF',
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 8) İPLİK TANIMLARI - Renkler
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Colors')
CREATE TABLE Colors (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    renk_adi        NVARCHAR(100)   NOT NULL,
    durum           NVARCHAR(10)    NOT NULL DEFAULT 'AKTIF',
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 9) İPLİK TANIMLARI - Kalınlıklar
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Thicknesses')
CREATE TABLE Thicknesses (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    birim           NVARCHAR(20)    NOT NULL,   -- Ne | Nm | Dtex | Denye
    deger           NVARCHAR(50)    NOT NULL,
    ozellik         NVARCHAR(200)   NULL,
    durum           NVARCHAR(10)    NOT NULL DEFAULT 'AKTIF',
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 10) İPLİK TANIMLARI - İplik Detayları (Kategori > Cins > Detay hiyerarşisi)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'YarnCategories')
CREATE TABLE YarnCategories (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    kategori_adi    NVARCHAR(200)   NOT NULL,
    durum           NVARCHAR(10)    NOT NULL DEFAULT 'AKTIF',
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'YarnTypes')
CREATE TABLE YarnTypes (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    kategori_id     INT             NOT NULL,
    cins_adi        NVARCHAR(200)   NOT NULL,
    durum           NVARCHAR(10)    NOT NULL DEFAULT 'AKTIF',
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_YarnTypes_Category FOREIGN KEY (kategori_id) REFERENCES YarnCategories(id)
);
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'YarnDetails')
CREATE TABLE YarnDetails (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    cins_id         INT             NOT NULL,
    detay_adi       NVARCHAR(200)   NOT NULL,
    durum           NVARCHAR(10)    NOT NULL DEFAULT 'AKTIF',
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_YarnDetails_Type FOREIGN KEY (cins_id) REFERENCES YarnTypes(id)
);
GO

-- ============================================================
-- 11) SİPARİŞ SAYACI
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderCounter')
CREATE TABLE OrderCounter (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    year        INT             NOT NULL UNIQUE,
    last_seq    INT             NOT NULL DEFAULT 0
);
GO

-- ============================================================
-- 12) SATIŞ SİPARİŞLERİ
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SalesOrders')
CREATE TABLE SalesOrders (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    order_no            NVARCHAR(50)    NOT NULL UNIQUE,    -- YYMMMNNNNN format
    customer_id         INT             NOT NULL,
    customer_name       NVARCHAR(300)   NOT NULL,
    customer_po_no      NVARCHAR(100)   NULL,
    order_date          NVARCHAR(20)    NOT NULL,
    requested_termin    NVARCHAR(20)    NOT NULL,
    confirmed_termin    NVARCHAR(20)    NOT NULL,
    shipped_at          NVARCHAR(30)    NULL,
    payment_terms       NVARCHAR(200)   NOT NULL,
    incoterm            NVARCHAR(20)    NULL,
    currency            NVARCHAR(10)    NOT NULL DEFAULT 'TRY',
    unit_price          NVARCHAR(50)    NULL,
    total_pairs         INT             NOT NULL DEFAULT 0,
    total_amount        NVARCHAR(50)    NOT NULL DEFAULT '0.00',
    status              NVARCHAR(20)    NOT NULL DEFAULT 'draft',
    notes               NVARCHAR(MAX)   NULL,
    internal_notes      NVARCHAR(MAX)   NULL,
    created_at          NVARCHAR(30)    NOT NULL,
    updated_at          NVARCHAR(30)    NOT NULL,
    CONSTRAINT FK_SalesOrders_Customer FOREIGN KEY (customer_id) REFERENCES Customers(id)
);
GO

CREATE INDEX IX_SalesOrders_Status ON SalesOrders(status);
CREATE INDEX IX_SalesOrders_CustomerID ON SalesOrders(customer_id);
CREATE INDEX IX_SalesOrders_OrderNo ON SalesOrders(order_no);
GO

-- ============================================================
-- 13) SİPARİŞ KALEMLERİ
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderLineItems')
CREATE TABLE OrderLineItems (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    order_id            INT             NOT NULL,
    line_id             NVARCHAR(50)    NOT NULL,       -- Frontend'deki unique id
    product_name        NVARCHAR(300)   NOT NULL,
    gender              NVARCHAR(100)   NULL,
    sock_type           NVARCHAR(100)   NULL,
    color               NVARCHAR(100)   NULL,
    size                NVARCHAR(100)   NULL,
    quantity            INT             NOT NULL DEFAULT 0,
    price_unit          NVARCHAR(50)    NOT NULL DEFAULT 'BIRIM_CIFT',
    unit_price          NVARCHAR(50)    NOT NULL DEFAULT '0',
    currency            NVARCHAR(10)    NULL DEFAULT 'TRY',
    line_total_pairs    INT             NOT NULL DEFAULT 0,
    line_amount         NVARCHAR(50)    NOT NULL DEFAULT '0.00',
    conversion_rate     DECIMAL(10,4)   NULL,
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_OrderLines_Order FOREIGN KEY (order_id) REFERENCES SalesOrders(id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_OrderLineItems_OrderID ON OrderLineItems(order_id);
GO

-- ============================================================
-- 14) FİYAT DEĞİŞİKLİK LOGLARI
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PriceAuditLogs')
CREATE TABLE PriceAuditLogs (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    order_id        NVARCHAR(50)    NOT NULL,
    field_name      NVARCHAR(100)   NOT NULL,
    old_value       NVARCHAR(200)   NULL,
    new_value       NVARCHAR(200)   NULL,
    changed_by      NVARCHAR(100)   NULL,
    changed_at      NVARCHAR(30)    NOT NULL
);
GO

-- ============================================================
-- 15) SİPARİŞ NUMARASI ÜRETME STORED PROCEDURE
-- ============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GenerateOrderNo')
    DROP PROCEDURE sp_GenerateOrderNo;
GO

CREATE PROCEDURE sp_GenerateOrderNo
    @MusteriNo NVARCHAR(50),
    @NewOrderNo NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Year INT = YEAR(GETDATE());
    DECLARE @YY NVARCHAR(2) = RIGHT(CAST(@Year AS NVARCHAR(4)), 2);
    DECLARE @MMM NVARCHAR(3);
    DECLARE @Seq INT;
    
    -- Müşteri no'yu 3 haneye formatla
    SET @MMM = RIGHT('000' + REPLACE(@MusteriNo, ' ', ''), 3);
    
    -- Sayacı al veya oluştur
    IF NOT EXISTS (SELECT 1 FROM OrderCounter WHERE year = @Year)
        INSERT INTO OrderCounter (year, last_seq) VALUES (@Year, 0);
    
    -- Sayacı artır
    UPDATE OrderCounter SET last_seq = last_seq + 1 WHERE year = @Year;
    SELECT @Seq = last_seq FROM OrderCounter WHERE year = @Year;
    
    -- Çakışma kontrolü
    WHILE EXISTS (
        SELECT 1 FROM SalesOrders 
        WHERE order_no LIKE @YY + '%' 
        AND RIGHT(order_no, 4) = RIGHT('0000' + CAST(@Seq AS NVARCHAR(10)), 4)
    )
    BEGIN
        SET @Seq = @Seq + 1;
        UPDATE OrderCounter SET last_seq = @Seq WHERE year = @Year;
    END
    
    SET @NewOrderNo = @YY + @MMM + RIGHT('0000' + CAST(@Seq AS NVARCHAR(10)), 4);
END
GO

PRINT '=== TÜM TABLOLAR VE PROSEDÜRLER BAŞARIYLA OLUŞTURULDU ===';
GO
