"use client";
import GeoFilesLoader from "@/components/GeoFilesLoader/GeoFilesLoader";
import { data } from "@/const/const";
import { Prefectures } from "@/const/Prefectures";
import { FocusContext } from "@/context/FocusContext";
import { calculateCenterPoint } from "@/utils/calculateCenterPoint";
import { loadAndAddToScene2D } from "@/utils/loadAndAddToScene2D";
import renderDot from "@/utils/renderDot";
import { resetScene } from "@/utils/resetScene";
import { useContext, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import "./page.module.scss";

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [center, setCenter] = useState<[number, number]>([0, 0]);

  const selectedData = Prefectures.Prefectures;
  const rootPath = selectedData && selectedData.rootPath;
  const geoFiles =
    selectedData && selectedData.geoFiles.map((f) => rootPath + f);

  const loader = new THREE.FileLoader().setResponseType("json");
  const sceneRef = useRef(new THREE.Scene());

  const [loadFileRemaining, setLoadFileRemaining] = useState(geoFiles.length);

  // focusNameをFocusContextから取得
  const focusName = useContext(FocusContext);

  useEffect(() => {
    if (!selectedData) {
      return;
    }
    // centerが指定されている場合
    if (selectedData.center) {
      setCenter(selectedData.center);
      return;
    }
    // centerを計算
    (async () => {
      const center = await calculateCenterPoint(geoFiles);
      setCenter(center);
      console.log("Center is at", center);
    })();
  }, []);

  useEffect(() => {
    if (!selectedData) {
      return;
    }
    if (!containerRef.current) {
      return;
    }
    // centerは更新されていない場合はスキップ
    if (center[0] === 0 && center[1] === 0) {
      return;
    }

    // 画面サイズの取得
    const sizes = { width: window.innerWidth, height: window.innerHeight };
    const aspect = sizes.width / sizes.height;
    const viewSize = 100;
    // OrthographicCameraの生成(2D用)
    const camera = new THREE.OrthographicCamera(
      (-viewSize * aspect) / 2,
      (viewSize * aspect) / 2,
      viewSize / 2,
      -viewSize / 2,
      -1000,
      1000
    );
    camera.position.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    containerRef.current.appendChild(renderer.domElement);

    // 追加: OrbitControls を生成
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.enableRotate = false; // 回転操作を無効にして平面と平行な移動に制限
    controls.enablePan = true; // パン操作を有効に（念のため明示的に設定）
    controls.touches.ONE = THREE.TOUCH.PAN; // 1本指タッチでパン操作するように設定
    controls.mouseButtons.LEFT = THREE.MOUSE.PAN; // マウス左ボタンでもパン操作するように設定

    sceneRef.current.add(camera);
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Object.keys(data).forEach((key) => {
    //   const location = data[key];
    //   const coord = location.coordinate;
    //   renderDot(scene, center, key, coord.lat, coord.lon);
    // });

    // グリッドを表示
    // render2DGrid(scene);

    // geoJSONファイルの読み込み
    geoFiles.forEach((f) => {
      loadAndAddToScene2D(
        f,
        center,
        0,
        loader,
        sceneRef.current,
        setLoadFileRemaining
      );
    });

    // 描画
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // 追加: コントロールを更新
      renderer.render(sceneRef.current, camera);
    };
    animate();

    const onResize = () => {
      if (!renderer || !containerRef.current) {
        return;
      }
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspect = width / height;
      const left = (-viewSize * aspect) / 2;
      const right = (viewSize * aspect) / 2;
      const top = viewSize / 2;
      const bottom = -viewSize / 2;
      camera.left = left;
      camera.right = right;
      camera.top = top;
      camera.bottom = bottom;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      controls.dispose(); // 追加: コントロールの破棄
      renderer.dispose();
      // ...existing cleanup code...
      resetScene(sceneRef.current);
    };
  }, [center]);

  // 地点のドット生成
  useEffect(() => {
    if (!selectedData) {
      return;
    }
    if (center[0] === 0 && center[1] === 0) {
      return;
    }

    // 一旦ドットを削除
    sceneRef.current.children
      .filter((child) => child.userData.isDot)
      .forEach((dot) => {
        sceneRef.current.remove(dot);
      });

    Object.keys(data).forEach((key) => {
      const location = data[key];
      const coord = location.coordinate;
      renderDot(
        sceneRef.current,
        center,
        key === focusName,
        coord.lat,
        coord.lon
      );
    });
  }, [center, focusName, sceneRef.current]);

  return (
    <>
      <GeoFilesLoader
        loadFileRemaining={loadFileRemaining}
        totalFileCount={geoFiles.length}
      />
      {selectedData ? (
        <div ref={containerRef} />
      ) : (
        <p style={{ color: "white", textAlign: "center" }}>
          データが見つかりません
        </p>
      )}
    </>
  );
}
