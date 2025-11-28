import pandas as pd
import json
import numpy as np

# Read the CSV file
df = pd.read_csv('/mnt/okcomputer/upload/Bihar District 2021-2025 RAINY DAYS.csv')

# Clean the data
df = df.dropna()  # Remove empty rows

# Create a clean dataset
rainfall_data = []

for index, row in df.iterrows():
    district_data = {
        'district': row['District'],
        'rainy_days_2021': int(row['2021']),
        'rainy_days_2022': int(row['2022']), 
        'rainy_days_2023': int(row['2023']),
        'rainy_days_2024': int(row['2024']),
        'rainy_days_2025': int(row['2025']),
        'total_rainy_days': int(row['Total 2021-25']),
        'avg_rainy_days': round(int(row['Total 2021-25']) / 5, 1)
    }
    rainfall_data.append(district_data)

# Save processed data
with open('/mnt/okcomputer/output/rainfall_data.json', 'w', encoding='utf-8') as f:
    json.dump(rainfall_data, f, ensure_ascii=False, indent=2)

# Calculate statistics
total_districts = len(rainfall_data)
avg_rainy_days_overall = sum(d['total_rainy_days'] for d in rainfall_data) / len(rainfall_data)
max_rainfall_district = max(rainfall_data, key=lambda x: x['total_rainy_days'])
min_rainfall_district = min(rainfall_data, key=lambda x: x['total_rainy_days'])

# Year-wise totals
yearly_totals = {
    '2021': sum(d['rainy_days_2021'] for d in rainfall_data),
    '2022': sum(d['rainy_days_2022'] for d in rainfall_data), 
    '2023': sum(d['rainy_days_2023'] for d in rainfall_data),
    '2024': sum(d['rainy_days_2024'] for d in rainfall_data),
    '2025': sum(d['rainy_days_2025'] for d in rainfall_data)
}

# Top 10 districts by total rainfall
top_10_districts = sorted(rainfall_data, key=lambda x: x['total_rainy_days'], reverse=True)[:10]

# Save summary statistics
summary_stats = {
    'total_districts': total_districts,
    'avg_rainy_days_overall': round(avg_rainy_days_overall, 1),
    'max_rainfall_district': max_rainfall_district,
    'min_rainfall_district': min_rainfall_district,
    'yearly_totals': yearly_totals,
    'top_10_districts': top_10_districts
}

with open('/mnt/okcomputer/output/summary_stats.json', 'w', encoding='utf-8') as f:
    json.dump(summary_stats, f, ensure_ascii=False, indent=2)

print("Data processing completed!")
print(f"Total districts: {total_districts}")
print(f"Average rainy days (5-year): {avg_rainy_days_overall:.1f}")
print(f"Highest rainfall district: {max_rainfall_district['district']} ({max_rainfall_district['total_rainy_days']} days)")
print(f"Lowest rainfall district: {min_rainfall_district['district']} ({min_rainfall_district['total_rainy_days']} days)")