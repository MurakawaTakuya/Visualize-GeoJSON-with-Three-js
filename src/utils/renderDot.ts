import { prefectureScale } from "@/const/const";
import * as THREE from "three";

export default function renderDot(
  scene: THREE.Scene,
  center: [number, number],
  isOnFocus: boolean,
  lat: number,
  lon: number
) {
  const circleGeometry = new THREE.CircleGeometry(0.2, 32);
  const circleMaterial = new THREE.MeshBasicMaterial({
    color: isOnFocus ? "yellow" : "red",
  });
  const centerCircle = new THREE.Mesh(circleGeometry, circleMaterial);
  // latitudeが0.1程度ずれているので補正
  centerCircle.position.set(
    (lon - center[0]) * prefectureScale,
    (lat - center[1] - 0.1) * prefectureScale,
    0
  );
  // ドットとして識別するため、keyをuserDataに設定
  centerCircle.userData.isDot = true;
  scene.add(centerCircle);
}
