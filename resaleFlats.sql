-- All code here are self-written
CREATE DATABASE resale_flats;

USE resale_flats;

CREATE TABLE Town (
    town_id INT AUTO_INCREMENT PRIMARY KEY,
    town VARCHAR(100) NOT NULL
);

CREATE TABLE Location (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    block VARCHAR(10) NOT NULL,
    street_name VARCHAR(100) NOT NULL,
    town_id INT NOT NULL,
    FOREIGN KEY (town_id) REFERENCES Town(town_id)
);

CREATE TABLE Flat (
    flat_id INT AUTO_INCREMENT PRIMARY KEY,
    flat_type VARCHAR(255),
    flat_model VARCHAR(255),
    storey_range VARCHAR(50),
    floor_area_sqm FLOAT,
    location_id INT,
    FOREIGN KEY (location_id) REFERENCES Location(location_id)
);

CREATE TABLE Price (
    price_id INT AUTO_INCREMENT PRIMARY KEY,
    month DATE NOT NULL,
    resale_price DECIMAL(10,2) NOT NULL,
    flat_id INT NOT NULL,
    FOREIGN KEY (flat_id) REFERENCES Flat(flat_id)
);

CREATE TABLE Lease (
    lease_id INT AUTO_INCREMENT PRIMARY KEY,
    lease_commence_date DATE NOT NULL,
    remaining_lease VARCHAR(50) NOT NULL,
    flat_id INT NOT NULL,
    FOREIGN KEY (flat_id) REFERENCES Flat(flat_id)
);

