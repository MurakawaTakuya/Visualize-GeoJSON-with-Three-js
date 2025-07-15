import { Feature, FeatureCollection, Polygon } from "geojson";
import { Dispatch } from "react";
import * as THREE from "three";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { calculateLatLonBounds, calculateZoomLevel } from "./coordinateTransform";

/**
 * 航空写真の読み込み（実際の航空写真を表示）
 * Google Maps Static APIまたはOpenStreetMapを使用して実際の航空写真を表示
 *
 * @param {THREE.FileLoader} loader
 * @param {string} terrainFile
 * @param {[number, number]} center
 * @param {THREE.Scene} scene
 * @param {GUI} gui
 * @param {Dispatch<React.SetStateAction<number>>} setLoadFileRemaining
 * @param {number} lat 緯度
 * @param {number} lon 経度
 */
export const loadAerialImagery = (
  loader: THREE.FileLoader,
  terrainFile: string,
  center: [number, number],
  scene: THREE.Scene,
  gui: GUI,
  setLoadFileRemaining: Dispatch<React.SetStateAction<number>>,
  lat: number,
  lon: number
) => {
  // 地形データを読み込んで境界を計算
  loader.load(terrainFile, (data: unknown) => {
    const fgData = data as FeatureCollection<Polygon, Record<string, unknown>>;
    
    // 地形データから境界を計算
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    fgData.features.forEach(
      (feature: Feature<Polygon, Record<string, unknown>>) => {
        const coordinates = feature.geometry!.coordinates;
        coordinates[0].forEach((point: number[]) => {
          const x = point[0] - center[0];
          const y = point[1] - center[1];
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        });
      }
    );

    // 実際の航空写真のテクスチャを作成（非同期）
    createRealAerialImageryTexture(scene, gui, lat, lon, minX, maxX, minY, maxY)
      .catch(error => {
        console.error("航空写真の作成中にエラーが発生:", error);
      });
    
    setLoadFileRemaining((prev) => prev - 1);
  });
};

/**
 * 実際の航空写真テクスチャを作成してシーンに追加
 * Google Maps Static APIまたはOpenStreetMap衛星画像を使用
 */
const createRealAerialImageryTexture = async (
  scene: THREE.Scene,
  gui: GUI,
  lat: number,
  lon: number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
) => {
  const width = maxX - minX;
  const height = maxY - minY;
  
  // プレーンジオメトリを作成（地形の境界に合わせる）
  const planeGeometry = new THREE.PlaneGeometry(width, height);
  
  // 緯度経度の境界を計算
  const bounds = calculateLatLonBounds(minX, maxX, minY, maxY, lat, lon);
  console.log("航空写真の境界:", bounds);
  
  // 適切なズームレベルを計算
  const zoom = calculateZoomLevel(bounds, 640, 640);
  console.log("ズームレベル:", zoom);
  
  // 航空写真を取得
  const imageUrl = await getAerialImageUrl(bounds, zoom, 640, 640);
  console.log("航空写真URL:", imageUrl);
  
  // テクスチャローダーで画像を読み込み
  const textureLoader = new THREE.TextureLoader();
  
  try {
    const texture = await new Promise<THREE.Texture>((resolve, reject) => {
      textureLoader.load(
        imageUrl,
        resolve,
        undefined,
        reject
      );
    });
    
    // テクスチャ設定
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    // マテリアルを作成
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.8,
    });
    
    // メッシュを作成
    const planeMesh = new THREE.Mesh(planeGeometry, material);
    
    // 位置を調整（中央に配置し、地面レベルに設定）
    planeMesh.position.set(
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      -0.5 // 地面より少し下に配置
    );
    
    // 回転行列を適用（地面に平行にする）
    const matrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
    planeMesh.applyMatrix4(matrix);
    
    // シーンに追加
    const group0 = scene.getObjectByName("terrain");
    if (group0) {
      group0.add(planeMesh);
    } else {
      const group = new THREE.Group();
      group.name = "terrain";
      group.add(planeMesh);
      scene.add(group);

      // GUIコントロールを追加
      gui
        .add({ aerialImagery: true }, "aerialImagery")
        .onChange((isVisible: boolean) => {
          const obj = scene.getObjectByName("terrain");
          if (obj) {
            obj.visible = isVisible;
          }
        })
        .name("航空写真");
    }
    
    console.log("実際の航空写真を表示しました");
    
  } catch (error) {
    console.error("航空写真の読み込みに失敗しました:", error);
    // フォールバック: 簡易的な地表テクスチャを作成
    createFallbackTexture(scene, gui, lat, lon, minX, maxX, minY, maxY);
  }
};

/**
 * 航空写真のURLを生成
 * 優先順位: Google Maps Static API > OpenStreetMap衛星画像
 */
const getAerialImageUrl = async (
  bounds: ReturnType<typeof calculateLatLonBounds>,
  zoom: number,
  width: number,
  height: number
): Promise<string> => {
  const { center } = bounds;
  
  // 環境変数からGoogle Maps APIキーを取得
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
                          process.env.GOOGLE_MAPS_API_KEY;
  
  if (googleMapsApiKey) {
    // Google Maps Static API
    const googleUrl = `https://maps.googleapis.com/maps/api/staticmap?` +
      `center=${center.lat},${center.lon}&` +
      `zoom=${zoom}&` +
      `size=${width}x${height}&` +
      `maptype=satellite&` +
      `key=${googleMapsApiKey}`;
    
    console.log("Google Maps Static APIを使用");
    return googleUrl;
  }
  
  // フォールバック: OpenStreetMap衛星画像（Esri World Imagery）
  // タイル座標を計算
  const tileX = Math.floor((center.lon + 180) / 360 * Math.pow(2, zoom));
  const tileY = Math.floor((1 - Math.log(Math.tan(center.lat * Math.PI / 180) + 
    1 / Math.cos(center.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
  
  console.log("OpenStreetMap衛星画像を使用（フォールバック）");
  
  // Esri World Imageryタイル
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${tileY}/${tileX}`;
};

/**
 * フォールバック: 簡易的な地表テクスチャを作成
 */
const createFallbackTexture = (
  scene: THREE.Scene,
  gui: GUI,
  lat: number,
  lon: number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
) => {
  const width = maxX - minX;
  const height = maxY - minY;
  
  // プレーンジオメトリを作成（地形の境界に合わせる）
  const planeGeometry = new THREE.PlaneGeometry(width, height);
  
  // 簡易的な航空写真風のテクスチャを作成
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 512;
  
  if (ctx) {
    // 地表の色を場所に応じて変更
    let baseColor = '#6B8E23'; // デフォルト: オリーブグリーン
    if (lat > 35.6 && lon > 139.6) { // 東京エリア
      baseColor = '#A0A0A0'; // グレー（都市部）
    } else if (lat > 35.1 && lon > 136.8) { // 名古屋エリア
      baseColor = '#8FBC8F'; // ダークシーグリーン
    }
    
    // グラデーションで地表を表現
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(0.3, '#8FBC8F');
    gradient.addColorStop(0.6, '#D2B48C');
    gradient.addColorStop(1, '#A0A0A0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // ランダムな建物や道路を表現
    ctx.fillStyle = '#708090';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const w = Math.random() * 50 + 10;
      const h = Math.random() * 200 + 20;
      ctx.fillRect(x, y, w, h);
    }
    
    // 建物を表現
    ctx.fillStyle = '#B8860B';
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 30 + 10;
      ctx.fillRect(x, y, size, size);
    }
  }
  
  // キャンバステクスチャを作成
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  
  // マテリアルを作成
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.7,
  });
  
  // メッシュを作成
  const planeMesh = new THREE.Mesh(planeGeometry, material);
  
  // 位置を調整（中央に配置し、地面レベルに設定）
  planeMesh.position.set(
    (minX + maxX) / 2,
    (minY + maxY) / 2,
    -0.5 // 地面より少し下に配置
  );
  
  // 回転行列を適用（地面に平行にする）
  const matrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
  planeMesh.applyMatrix4(matrix);
  
  // シーンに追加
  const group0 = scene.getObjectByName("terrain");
  if (group0) {
    group0.add(planeMesh);
  } else {
    const group = new THREE.Group();
    group.name = "terrain";
    group.add(planeMesh);
    scene.add(group);

    // GUIコントロールを追加
    gui
      .add({ aerialImagery: true }, "aerialImagery")
      .onChange((isVisible: boolean) => {
        const obj = scene.getObjectByName("terrain");
        if (obj) {
          obj.visible = isVisible;
        }
      })
      .name("航空写真");
  }
  
  console.log("フォールバック用の地表テクスチャを作成しました");
};

