# Visualize GeoJSON with Three.js
This app visualizes GeoJSON data with Three.js. GeoJSON data is generated with [convert-shp-to-geojson](https://github.com/MurakawaTakuya/convert-shp-to-geojson) using shp files.

## Features
- 3D visualization of indoor maps from open data
- Real aerial imagery backgrounds with precise coordinate alignment
- Interactive controls for floors and terrain visualization
- WebGPU support for enhanced performance

## Tech Stack
- Next.js
- Three.js

## Aerial Imagery Configuration
The app supports real aerial imagery backgrounds for locations with terrain data. To use high-quality Google Maps satellite imagery:

1. Copy `.env.example` to `.env.local`
2. Add your Google Maps API key:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
3. If no API key is provided, the app will use OpenStreetMap satellite tiles as a fallback

## Data Source
3Dデータ: [国土交通省 G空間情報センター](https://www.geospatial.jp/ckan/organization/seisakutokatsu)
- `ShinjukuTerminal`: [新宿駅周辺屋内地図オープンデータ（令和2年度更新版）](https://www.geospatial.jp/ckan/dataset/mlit-indoor-shinjuku-r2)
- `NagoyaUnimall`: [ユニモール地下街 屋内地図オープンデータ](https://www.geospatial.jp/ckan/dataset/city-nagoya-indoor-unimall)
- `NagoyaCentralPark`: [セントラルパーク地下街 屋内地図オープンデータ](https://www.geospatial.jp/ckan/dataset/city-nagoya-indoor-centralpark?resource_id=f803f525-bd47-44f3-8a99-9ad1a01205f8)
- `NaritaAirport`: [成田国際空港屋内地図オープンデータ（令和２年度更新版）](https://www.geospatial.jp/ckan/dataset/mlit-indoor-narita-airport-r2)
- `NissanStd`: [横浜国際総合競技場屋内地図オープンデータ](https://www.geospatial.jp/ckan/dataset/mlit-indoor-yokohama-arena)
- `ShinyokohamaStation`: [新横浜駅屋内地図オープンデータ](https://www.geospatial.jp/ckan/dataset/mlit-indoor-shin-yokohama)
- `TokyoStation`: [東京駅周辺屋内地図オープンデータ（令和２年度更新版）](https://www.geospatial.jp/ckan/dataset/mlit-indoor-tokyo-r2)

日本地図(県境): [47都道府県のポリゴンデータ geojson](https://japonyol.net/editor/article/47-prefectures-geojson.html)

The code I referred to is [Three.jsで新宿駅構内図を3Dで可視化してみる](https://qiita.com/satoshi7190/items/23d192372877af75b283)
