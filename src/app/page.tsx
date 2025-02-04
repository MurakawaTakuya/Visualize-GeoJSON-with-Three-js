"use client";
import ThreeScene from "./ThreeScene";
import "./page.module.scss";

export default function Page() {
  return (
    <div>
      <span style={{ color: "white" }}>
        「新宿駅周辺屋内地図データ」（国土交通省）（
        <a
          href="https://www.geospatial.jp/ckan/dataset/mlit-indoor-shinjuku-r2"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://www.geospatial.jp/ckan/dataset/mlit-indoor-shinjuku-r2
        </a>
        ）を加工して作成
      </span>

      <ThreeScene />
    </div>
  );
}
