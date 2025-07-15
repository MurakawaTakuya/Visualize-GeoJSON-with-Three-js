import { Feature, FeatureCollection, Polygon } from "geojson";
import { Dispatch } from "react";
import * as THREE from "three";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

/**
 * 航空写真の読み込み（地形データの代替）
 * Google Maps Static APIを使用して航空写真を表示
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

    // 航空写真のテクスチャを作成
    createAerialImageryTexture(scene, gui, lat, lon, minX, maxX, minY, maxY);
    
    setLoadFileRemaining((prev) => prev - 1);
  });
};

/**
 * 航空写真風テクスチャを作成してシーンに追加
 * （実際の航空写真の代わりに、地形を表現する色付きプレーンを使用）
 */
const createAerialImageryTexture = (
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
  
  // 航空写真風のテクスチャを作成（実際の写真の代わりに）
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 512;
  
  if (ctx) {
    // グラデーションで地表を表現
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, '#6B8E23'); // オリーブグリーン（植物）
    gradient.addColorStop(0.3, '#8FBC8F'); // ダークシーグリーン
    gradient.addColorStop(0.6, '#D2B48C'); // タン（土地）
    gradient.addColorStop(1, '#A0A0A0'); // グレー（都市部）
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // ランダムな建物や道路を表現
    ctx.fillStyle = '#708090'; // スレートグレー（道路）
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const w = Math.random() * 50 + 10;
      const h = Math.random() * 200 + 20;
      ctx.fillRect(x, y, w, h);
    }
    
    // 建物を表現
    ctx.fillStyle = '#B8860B'; // ダークゴールデンロッド（建物）
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
  
  console.log("航空写真風背景を作成しました");
};

