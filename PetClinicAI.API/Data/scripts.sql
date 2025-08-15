
-- Use the new database
USE PetClinicAI;
GO

-- Create the schema
CREATE SCHEMA clinic;
GO

-- Create Owners table
CREATE TABLE clinic.Owners (
    OwnerId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(120) NOT NULL,
    Email NVARCHAR(160) NULL,
    Phone NVARCHAR(40) NULL,
    CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);
GO

-- Create Pets table
CREATE TABLE clinic.Pets (
    PetId INT IDENTITY(1,1) PRIMARY KEY,
    OwnerId INT NOT NULL,
    PetName NVARCHAR(80) NOT NULL,
    Species NVARCHAR(40) NOT NULL CHECK (Species IN ('Dog', 'Cat', 'Other')),
    Breed NVARCHAR(80) NULL,
    BirthDate DATE NULL,
    IsNeutered BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Pets_Owners FOREIGN KEY (OwnerId) REFERENCES clinic.Owners(OwnerId)
);
GO

-- Create Appointments table
CREATE TABLE clinic.Appointments (
    AppointmentId INT IDENTITY(1,1) PRIMARY KEY,
    PetId INT NOT NULL,
    VisitDate DATETIME2 NOT NULL,
    Reason NVARCHAR(200) NOT NULL,
    Notes NVARCHAR(400) NULL,
    Status NVARCHAR(20) DEFAULT 'Scheduled' CHECK (Status IN ('Scheduled', 'Completed', 'Cancelled')),
    CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Appointments_Pets FOREIGN KEY (PetId) REFERENCES clinic.Pets(PetId)
);
GO

-- Create indexes
CREATE INDEX IX_Pets_OwnerId ON clinic.Pets (OwnerId);
CREATE INDEX IX_Appointments_PetId ON clinic.Appointments (PetId);
CREATE INDEX IX_Appointments_VisitDate ON clinic.Appointments (VisitDate);
GO