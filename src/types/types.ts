import * as THREE from "three";
// GeoJSON用プロパティの型定義
export interface LinkProperties {
  start_id: number;
  end_id: number;
  direction: number;
}

export interface NodeProperties {
  node_id: number;
  ordinal: number;
}

export interface CustomShader {
  uniforms: { [uniform: string]: THREE.IUniform };
  vertexShader: string;
  fragmentShader: string;
}

export interface FileStructure {
  name: string;
  rootPath: string;
  networkFile?: { node: string; link: string };
  terrainFile?: string;
  geoFiles: string[];
  center?: [number, number];
  coordinate: { lat: number; lon: number };
}

export interface MaterialWithTextures extends THREE.Material {
  map?: THREE.Texture;
  lightMap?: THREE.Texture;
  aoMap?: THREE.Texture;
  emissiveMap?: THREE.Texture;
  bumpMap?: THREE.Texture;
  normalMap?: THREE.Texture;
  displacementMap?: THREE.Texture;
  roughnessMap?: THREE.Texture;
  metalnessMap?: THREE.Texture;
  alphaMap?: THREE.Texture;
  envMap?: THREE.Texture;
  [key: string]: unknown;
}
