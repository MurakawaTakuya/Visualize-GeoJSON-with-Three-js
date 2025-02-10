import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

/**
 * 階層グループの作成とGUIを設定
 *
 * @param {GUI} gui
 * @param {THREE.Scene} scene
 * @param {number[]} floorList
 */
export const loadGUI = (gui: GUI, scene: THREE.Scene, floorList: number[]) => {
  if (window.innerWidth < 767) {
    gui.close();
  }

  // Polygon
  floorList.sort((a, b) => b - a);
  floorList.forEach((num) => {
    const group = new THREE.Group();
    group.name = `group${num}`;
    scene.add(group);
    const guiName =
      num === 0 ? "地上" : num > 0 ? `${num}F` : "B" + Math.abs(num);
    gui
      .add({ [`group${num}`]: true }, `group${num}`)
      .onChange((isVisible: boolean) => {
        const obj = scene.getObjectByName(`group${num}`);
        if (obj) {
          obj.visible = isVisible;
        }
      })
      .name(guiName);
  });

  const lineStringGroup = new THREE.Group();
  lineStringGroup.name = "LineString";
  scene.add(lineStringGroup);
  // LineString
  gui
    .add({ lineString: true }, "lineString")
    .onChange((isVisible: boolean) => {
      const obj = scene.getObjectByName("LineString");
      if (obj) {
        obj.visible = isVisible;
      }
    })
    .name("LineString");

  const pointGroup = new THREE.Group();
  pointGroup.name = "Point";
  scene.add(pointGroup);
  // Point
  gui
    .add({ point: true }, "point")
    .onChange((isVisible: boolean) => {
      const obj = scene.getObjectByName("Point");
      if (obj) {
        obj.visible = isVisible;
      }
    })
    .name("設備");
};
