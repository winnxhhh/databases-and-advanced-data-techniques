# All code here are self-written
import pandas as pd

# Load CSV file
file_path = "/home/coder/project/resaleFlats.csv"
data = pd.read_csv(file_path)

# Convert the 'month' column to datetime to extract the year
data['month'] = pd.to_datetime(data['month'], errors='coerce')  # Handle invalid dates gracefully
data['lease_commence_date'] = pd.to_datetime(data['lease_commence_date'], format='%Y', errors='coerce').dt.date # Converts lease_commence_date to DATE 

# Filter data such that we only use the data found between 2019-12 and 2021-12
filtered_data = data[(data['month'] >= '2019-12-01') &
                     (data['month'] <= '2021-12-31')]

# Prepare SQL lists
town_sql = []
location_sql = []
flat_sql = []
price_sql = []
lease_sql = []

# Generate SQL for each table
for i, row in filtered_data.iterrows():
    # Insert for Town
    town_name = row['town'].replace("'", "''")
    if town_name not in [sql.split("'")[1] for sql in town_sql]:
        town_sql.append(f"INSERT INTO Town (town) VALUES ('{town_name}');")

    # # Insert for Location
    block = row['block'].replace("'", "''")
    street = row['street_name'].replace("'", "''")
    location_sql.append(
        f"INSERT INTO Location (block, street_name, town_id) VALUES ('{block}', '{street}', "
        f"(SELECT town_id FROM Town WHERE town = '{town_name}'));"
    )
# Saves Town.sql and Location.sql
with open("Town.sql", "w") as f: f.writelines("\n".join(town_sql))
with open("Location.sql", "w") as f: f.writelines("\n".join(location_sql))

# Insert for Flat
# Initialize location_id and define maximum location_id
location_id = 1
max_location_id = 54268

# Open file for writing
with open("Flat.sql", "w") as f:
    # Process data in batches
    # Process in chunks of 1000 rows
    for start_idx in range(0, len(filtered_data), 1000):
        batch = filtered_data.iloc[start_idx:start_idx + 1000]

        # Generate SQL for the batch
        sql_statements = []
        for _, row in batch.iterrows():
            flat_type = row['flat_type'].replace("'", "''")
            flat_model = row['flat_model'].replace("'", "''")
            storey = row['storey_range'].replace("'", "''")

            sql_statements.append(
                f"INSERT INTO Flat (flat_type, flat_model, storey_range, floor_area_sqm, location_id) VALUES "
                f"('{flat_type}', '{flat_model}', '{storey}', {row['floor_area_sqm']}, {location_id});"
            )
            location_id += 1
            if location_id > max_location_id:
                location_id = 1  # Reset location_id

        # Write batch to file
        f.writelines("\n".join(sql_statements) + "\n")

# Insert for Price 
# Initialize flat_id and define maximum flat_id
flat_id = 1
max_flat_id = 54268

with open("Price.sql", "w") as f:
        # Process data in batches
        # Process in chunks of 1000 rows
    for start_idx in range(0, len(filtered_data), 1000):
        batch = filtered_data.iloc[start_idx:start_idx + 1000]

        # Generate SQL for the batch
        sql_statements = []
        for _, row in batch.iterrows():
            sql_statements.append(
                f"INSERT INTO Price (month, resale_price, flat_id) VALUES ('{row['month']}', {row['resale_price']}, {flat_id});"
            )
            flat_id += 1
            if flat_id > max_flat_id:
                flat_id = 1  # Reset location_id

        # Write batch to file
        f.writelines("\n".join(sql_statements) + "\n")

# Insert for Lease
with open("Lease.sql", "w") as f:
    # Process data in batches
    # Process in chunks of 1000 rows
    for start_idx in range(0, len(filtered_data), 1000):
        batch = filtered_data.iloc[start_idx:start_idx + 1000]

        # Generate SQL for the batch
        sql_statements = []
        for _, row in batch.iterrows():
            remaining_lease = row['remaining_lease'].replace("'", "''")
            sql_statements.append(
                f"INSERT INTO Lease (lease_commence_date, remaining_lease, flat_id) VALUES ('{row['lease_commence_date']}',  '{remaining_lease}', {flat_id});"
            )
            flat_id += 1
            if flat_id > max_flat_id:
                flat_id = 1  # Reset location_id

        # Write batch to file
        f.writelines("\n".join(sql_statements) + "\n")