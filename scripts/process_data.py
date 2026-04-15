import csv
import os
from datetime import datetime

def process_csv(input_file, output_file):
    """
    Reads a CSV file, performs transformations, and writes to a new CSV file.
    """
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found.")
        return

    print(f"Processing '{input_file}'...")

    processed_data = []
    
    try:
        with open(input_file, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            # Get fieldnames and add a new one for transformation
            fieldnames = reader.fieldnames + ['processed_at', 'is_active_member']
            
            for row in reader:
                # --- Transformations ---
                
                # 1. Clean whitespace from names
                row['name'] = row['name'].strip()
                
                # 2. Convert email to lowercase
                row['email'] = row['email'].lower()
                
                # 3. Add a timestamp of when it was processed
                row['processed_at'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                
                # 4. Logic-based transformation: check if status is active
                row['is_active_member'] = 'Yes' if row['subscription_status'].lower() == 'active' else 'No'
                
                # 5. Example of data validation/filtering (optional)
                # if row['subscription_status'] == 'inactive': continue
                
                processed_data.append(row)

        # Write the processed data to the output file
        with open(output_file, mode='w', encoding='utf-8', newline='') as file:
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(processed_data)

        print(f"Successfully processed {len(processed_data)} rows.")
        print(f"Output saved to '{output_file}'.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # Define paths
    INPUT_PATH = 'data/input.csv'
    OUTPUT_PATH = 'data/output.csv'
    
    # Ensure data directory exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    
    process_csv(INPUT_PATH, OUTPUT_PATH)
