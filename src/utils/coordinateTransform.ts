/**
 * 座標変換ユーティリティ
 * 日本平面直角座標系からWGS84（緯度経度）への変換
 */

/**
 * 日本平面直角座標系の係数 (EPSG:6677 = JGD2011 / Japan Plane Rectangular CS IX)
 * 新宿・名古屋エリアで使用される座標系
 */
const COORDINATE_SYSTEM_IX = {
  // 原点の緯度経度 (度)
  phi0: 36.0, // 原点緯度
  lambda0: 139.833333333, // 原点経度 (139度50分)
  
  // 地球楕円体パラメータ (GRS80)
  a: 6378137.0, // 長半径
  f: 1 / 298.257222101, // 扁平率
};

/**
 * 度をラジアンに変換
 */
const degToRad = (deg: number): number => deg * Math.PI / 180;

/**
 * ラジアンを度に変換
 */
const radToDeg = (rad: number): number => rad * 180 / Math.PI;

/**
 * 平面直角座標から緯度経度への変換（簡易版）
 * @param x 平面直角座標のX座標 (m)
 * @param y 平面直角座標のY座標 (m)
 * @param centerLat 中心点の緯度 (度)
 * @param centerLon 中心点の経度 (度)
 * @returns {lat: number, lon: number} 緯度経度 (度)
 */
export const transformToLatLon = (
  x: number,
  y: number,
  centerLat: number,
  centerLon: number
): { lat: number; lon: number } => {
  // 簡易的な変換: メートル単位の座標を度に変換
  // 日本では緯度1度 ≈ 111,320m, 経度1度 ≈ 91,290m (緯度35度付近)
  const meterPerDegreeLat = 111320;
  const meterPerDegreeLon = 91290; // 緯度35度付近での近似値
  
  const deltaLat = y / meterPerDegreeLat;
  const deltaLon = x / meterPerDegreeLon;
  
  return {
    lat: centerLat + deltaLat,
    lon: centerLon + deltaLon
  };
};

/**
 * 地形データの境界から緯度経度の境界を計算
 * @param minX 最小X座標
 * @param maxX 最大X座標
 * @param minY 最小Y座標
 * @param maxY 最大Y座標
 * @param centerLat 中心点の緯度
 * @param centerLon 中心点の経度
 * @returns 緯度経度の境界
 */
export const calculateLatLonBounds = (
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  centerLat: number,
  centerLon: number
) => {
  const sw = transformToLatLon(minX, minY, centerLat, centerLon);
  const ne = transformToLatLon(maxX, maxY, centerLat, centerLon);
  
  return {
    southwest: sw,
    northeast: ne,
    center: { lat: (sw.lat + ne.lat) / 2, lon: (sw.lon + ne.lon) / 2 }
  };
};

/**
 * 緯度経度の境界から適切なズームレベルを計算
 * @param bounds 緯度経度の境界
 * @param width 画像の幅（ピクセル）
 * @param height 画像の高さ（ピクセル）
 * @returns 適切なズームレベル
 */
export const calculateZoomLevel = (
  bounds: { southwest: { lat: number; lon: number }; northeast: { lat: number; lon: number } },
  width: number = 640,
  height: number = 640
): number => {
  const latDiff = Math.abs(bounds.northeast.lat - bounds.southwest.lat);
  const lonDiff = Math.abs(bounds.northeast.lon - bounds.southwest.lon);
  
  // ズームレベルの計算（経験的な式）
  const latZoom = Math.log2(360 / latDiff) - Math.log2(height / 256);
  const lonZoom = Math.log2(360 / lonDiff) - Math.log2(width / 256);
  
  // より小さい方のズームレベルを使用（全体が収まるように）
  const zoom = Math.floor(Math.min(latZoom, lonZoom));
  
  // ズームレベルを1-20の範囲に制限
  return Math.max(1, Math.min(20, zoom));
};