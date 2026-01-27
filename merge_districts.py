
import geopandas as gpd
import os

INPUT_FILE = 'public/data/nepal_constituencies.geojson'
OUTPUT_FILE = 'public/data/nepal_districts.geojson'

def merge_districts():
    print(f"Reading {INPUT_FILE}...")
    try:
        if not os.path.exists(INPUT_FILE):
             print(f"Error: {INPUT_FILE} not found.")
             return

        gdf = gpd.read_file(INPUT_FILE)
        print(f"Loaded {len(gdf)} constituencies.")
        
        if 'district' not in gdf.columns:
            print("Error: 'district' column not found in GeoJSON.")
            return

        print("Fixing invalid geometries...")
        # buffer(0) is a standard trick to fix self-intersections and validity issues
        gdf['geometry'] = gdf['geometry'].buffer(0)

        print("Dissolving by 'district'...")
        # Dissolve by 'district' column
        districts_gdf = gdf.dissolve(by='district')
        
        # Reset index to make 'district' a column again (optional, depending on desired structure)
        districts_gdf = districts_gdf.reset_index()
        
        # Keep only necessary columns if needed, or keep all aggregated
        # For map labeling, we mainly need the district name (now in 'district' column)
        
        print(f"Merged into {len(districts_gdf)} districts.")
        
        print(f"Saving to {OUTPUT_FILE}...")
        districts_gdf.to_file(OUTPUT_FILE, driver='GeoJSON')
        print("Done.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    merge_districts()
