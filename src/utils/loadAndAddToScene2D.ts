import { prefectureScale, verticalOffset } from "@/const/const";
import { Feature, FeatureCollection } from "geojson";
import { Dispatch } from "react";
import * as THREE from "three";

/**
 * GeoJSONデータを読み込んでシーンに2次元オブジェクトとして追加
 *
 * @param {string} geojson
 * @param {[number, number]} center
 * @param {number} floorNumber
 * @param {number} depth
 */
export const loadAndAddToScene2D = (
  geojson: string,
  center: [number, number],
  floorNumber: number,
  loader: THREE.FileLoader,
  scene: THREE.Scene,
  setLoadFileRemaining: Dispatch<React.SetStateAction<number>>
): void => {
  loader.load(geojson, (data: unknown) => {
    // サイズ
    const geoData = data as FeatureCollection<
      GeoJSON.Geometry,
      Record<string, unknown>
    >;
    geoData.features
      .filter(
        (feature: Feature<GeoJSON.Geometry, Record<string, unknown>>) =>
          feature.geometry !== null
      )
      .forEach(
        (feature: Feature<GeoJSON.Geometry, Record<string, unknown>>) => {
          switch (feature.geometry.type) {
            case "Point": {
              // 2D用の円形ジオメトリで点を表現
              const [longitude, latitude] = feature.geometry.coordinates as [
                number,
                number,
              ];
              const pointGeometry = new THREE.CircleGeometry(0.1, 32);
              const pointMaterial = new THREE.MeshBasicMaterial({
                color: "rgb(255, 0, 0)",
              });
              pointGeometry.translate(
                (longitude - center[0]) * prefectureScale,
                (latitude - center[1]) * prefectureScale,
                0
              );
              const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
              pointMesh.position.y += floorNumber * verticalOffset - 1;
              let group = scene.getObjectByName("Point2D");
              if (group) {
                group.add(pointMesh);
              } else {
                group = new THREE.Group();
                group.name = "Point2D";
                group.add(pointMesh);
                scene.add(group);
              }
              break;
            }
            case "LineString": {
              // 2D用のLineStringを作成
              const points = (
                feature.geometry.coordinates as [number, number][]
              ).map(
                ([lng, lat]) =>
                  new THREE.Vector3(
                    (lng - center[0]) * prefectureScale,
                    (lat - center[1]) * prefectureScale,
                    0
                  )
              );
              const lineGeometry = new THREE.BufferGeometry().setFromPoints(
                points
              );
              const lineMaterial = new THREE.LineBasicMaterial({
                color: "rgb(98, 232, 255)",
              });
              const line = new THREE.Line(lineGeometry, lineMaterial);
              line.position.y += floorNumber * verticalOffset - 1;
              let group = scene.getObjectByName("LineString2D");
              if (group) {
                group.add(line);
              } else {
                group = new THREE.Group();
                group.name = "LineString2D";
                group.add(line);
                scene.add(group);
              }
              break;
            }
            case "Polygon": {
              // 2D用のShapeGeometryを作成
              const coordinates = feature.geometry.coordinates[0] as [
                number,
                number,
              ][];
              const shape = new THREE.Shape(
                coordinates.map(
                  ([lng, lat]) =>
                    new THREE.Vector2(
                      (lng - center[0]) * prefectureScale,
                      (lat - center[1]) * prefectureScale
                    )
                )
              );
              const geometry = new THREE.ShapeGeometry(shape);
              const lineMaterial = new THREE.LineBasicMaterial({
                color: "rgb(255, 255, 255)",
                transparent: true,
                opacity: 0.9,
              });
              const edges = new THREE.EdgesGeometry(geometry);
              const line = new THREE.LineSegments(edges, lineMaterial);
              line.position.y += floorNumber * verticalOffset - 1;
              let group = scene.getObjectByName(`group2D_${floorNumber}`);
              if (group) {
                group.add(line);
              } else {
                group = new THREE.Group();
                group.name = `group2D_${floorNumber}`;
                group.add(line);
                scene.add(group);
              }
              break;
            }
            case "MultiPolygon": {
              // 2D用のMultiPolygonを作成
              (feature.geometry.coordinates as number[][][][]).forEach(
                (coordinates) => {
                  const shape = new THREE.Shape(
                    (coordinates[0] as [number, number][]).map(
                      ([lng, lat]) =>
                        new THREE.Vector2(
                          (lng - center[0]) * prefectureScale,
                          (lat - center[1]) * prefectureScale
                        )
                    )
                  );
                  const geometry = new THREE.ShapeGeometry(shape);
                  const lineMaterial = new THREE.LineBasicMaterial({
                    color: "rgb(255, 255, 255)",
                    transparent: true,
                    opacity: 0.9,
                  });
                  const edges = new THREE.EdgesGeometry(geometry);
                  const line = new THREE.LineSegments(edges, lineMaterial);
                  line.position.y += floorNumber * verticalOffset - 1;
                  let group = scene.getObjectByName(`group2D_${floorNumber}`);
                  if (group) {
                    group.add(line);
                  } else {
                    group = new THREE.Group();
                    group.name = `group2D_${floorNumber}`;
                    group.add(line);
                    scene.add(group);
                  }
                }
              );
              break;
            }
          }
        }
      );
    setLoadFileRemaining((prev) => prev - 1);
  });
};
