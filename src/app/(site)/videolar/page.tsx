import { type CSSProperties, Suspense } from "react";
import LoadingState from "@/components/LoadingState";
import PublicContentList from "@/components/PublicContentList";
import VideoCard from "@/components/VideoCard";
import { getVideos } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Videolar",
  description: "Medikal ozon tedavisi ve uygulama yöntemleri üzerine Prof. Dr. Muharrem Kıskaç'ın videoları.",
  path: "/videolar",
});

// data-enter gecikmesi: sıra numarası CSS'te --i olarak okunur.
const enterDelay = (i: number) => ({ "--i": i }) as CSSProperties;

export default function VideosPage() {
  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow} data-enter style={enterDelay(0)}>
          Rehber
        </p>
        <h1 className={styles.title} data-enter style={enterDelay(1)}>
          Videolar
        </h1>
      </header>
      <div className={styles.body}>
        <Suspense fallback={<LoadingState />}>
          <PublicContentList
            load={getVideos}
            emptyText="Henüz yayınlanmış bir video bulunmuyor."
            renderItem={(video, index) => (
              <VideoCard video={video} index={index} />
            )}
          />
        </Suspense>
      </div>
    </main>
  );
}
