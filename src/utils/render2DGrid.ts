import { prefectureScale } from "@/const/const";
import * as THREE from "three";

export default function render2DGrid(scene: THREE.Scene) {
  const gridSize = 1000 * prefectureScale;

  // 0.1単位ごとのグリッド(白)
  const smallestDivisions = gridSize;
  const whiteGrid = new THREE.GridHelper(
    gridSize,
    smallestDivisions,
    "white",
    "white"
  );
  whiteGrid.rotation.x = -Math.PI / 2;
  scene.add(whiteGrid);

  // 1単位ごとのグリッド(青)
  const minorDivisions = gridSize / 10;
  const minorGrid = new THREE.GridHelper(
    gridSize,
    minorDivisions,
    "blue",
    "blue"
  );
  minorGrid.rotation.x = -Math.PI / 2;
  scene.add(minorGrid);

  // 10単位ごとのグリッド(赤)
  const majorDivisions = gridSize / 100;
  const majorGrid = new THREE.GridHelper(
    gridSize,
    majorDivisions,
    "red",
    "red"
  );
  majorGrid.rotation.x = -Math.PI / 2;
  scene.add(majorGrid);
}
