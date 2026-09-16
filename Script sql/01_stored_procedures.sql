/*
   Tarea 1 - API AdventureWorks
   Stored Procedures para el CRUD
*/
USE AdventureWorks;
GO

/* SELECT simple */
IF OBJECT_ID('dbo.usp_ShipMethod_SelectAll', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_ShipMethod_SelectAll;
GO
CREATE PROCEDURE dbo.usp_ShipMethod_SelectAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT ShipMethodID, Name, ShipBase, ShipRate, ModifiedDate
    FROM Purchasing.ShipMethod
    ORDER BY ShipMethodID;
END
GO

/* SELECT con JOIN */
IF OBJECT_ID('dbo.usp_PurchaseOrder_SelectWithVendorAndShip', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_PurchaseOrder_SelectWithVendorAndShip;
GO
CREATE PROCEDURE dbo.usp_PurchaseOrder_SelectWithVendorAndShip
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        poh.PurchaseOrderID,
        v.Name AS VendorName,
        sm.Name AS ShipMethodName,
        poh.OrderDate,
        poh.TotalDue
    FROM Purchasing.PurchaseOrderHeader poh
    INNER JOIN Purchasing.Vendor v ON poh.VendorID = v.BusinessEntityID
    INNER JOIN Purchasing.ShipMethod sm ON poh.ShipMethodID = sm.ShipMethodID
    ORDER BY poh.PurchaseOrderID;
END
GO

/* INSERT */
IF OBJECT_ID('dbo.usp_ShipMethod_Insert', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_ShipMethod_Insert;
GO
CREATE PROCEDURE dbo.usp_ShipMethod_Insert
    @Name NVARCHAR(50),
    @ShipBase MONEY,
    @ShipRate MONEY
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Purchasing.ShipMethod (Name, ShipBase, ShipRate, rowguid, ModifiedDate)
    VALUES (@Name, @ShipBase, @ShipRate, NEWID(), GETDATE());

    SELECT SCOPE_IDENTITY() AS NewShipMethodID;
END
GO

/* UPDATE */
IF OBJECT_ID('dbo.usp_ShipMethod_Update', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_ShipMethod_Update;
GO
CREATE PROCEDURE dbo.usp_ShipMethod_Update
    @ShipMethodID INT,
    @Name NVARCHAR(50),
    @ShipBase MONEY,
    @ShipRate MONEY
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Purchasing.ShipMethod
    SET Name = @Name,
        ShipBase = @ShipBase,
        ShipRate = @ShipRate,
        ModifiedDate = GETDATE()
    WHERE ShipMethodID = @ShipMethodID;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

/* DELETE */
IF OBJECT_ID('dbo.usp_ShipMethod_Delete', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_ShipMethod_Delete;
GO
CREATE PROCEDURE dbo.usp_ShipMethod_Delete
    @ShipMethodID INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Purchasing.ShipMethod
    WHERE ShipMethodID = @ShipMethodID;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO