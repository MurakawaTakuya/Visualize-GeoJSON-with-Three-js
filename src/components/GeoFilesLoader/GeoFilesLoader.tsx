import CircularProgress from "@mui/joy/CircularProgress";
import styles from "./GeoFilesLoader.module.scss";

export default function GeoFilesLoader({
  loadFileRemaining,
  totalFileCount,
  showProgress,
}: {
  loadFileRemaining: number;
  totalFileCount: number;
  showProgress?: boolean;
}) {
  return (
    <>
      {loadFileRemaining > 0 && (
        <div className={styles.loaderWrapper}>
          <CircularProgress size="lg" variant="plain" />
          {showProgress && (
            <p
              style={{ color: "white", textAlign: "center", marginTop: "3px" }}
            >
              {totalFileCount - loadFileRemaining} / {totalFileCount}
            </p>
          )}
        </div>
      )}
    </>
  );
}
