"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { videoThumbnail } from "@/lib/youtube";
import type { Video } from "@/types/content";
import CardMedia from "./CardMedia";
import styles from "./VideoCard.module.css";

type VideoCardProps = {
  video: Video;
  // Izgaradaki sıra; açılış gecikmesi için (--i = index % 3).
  index?: number;
};

export default function VideoCard({ video, index = 0 }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const thumbnail = videoThumbnail(video);

  // Oynat butonu kaldırıldığında klavye odağı kaybolmasın diye iframe'e taşınır.
  useEffect(() => {
    if (isPlaying) iframeRef.current?.focus();
  }, [isPlaying]);

  return (
    <article
      className={styles.card}
      data-reveal
      style={{ "--i": index % 3 } as CSSProperties}
    >
      {isPlaying ? (
        <div className={styles.videoContainer}>
          <iframe
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            className={styles.iframe}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <CardMedia
          className={styles.media}
          src={thumbnail}
          onClick={() => setIsPlaying(true)}
          buttonLabel={`${video.title} videosunu oynat`}
        >
          <span className={styles.playOverlay} aria-hidden="true">
            <span className={styles.playButton}>
              <svg
                className={styles.playIcon}
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M9 6.5v11l9-5.5z" fill="currentColor" />
              </svg>
            </span>
          </span>
        </CardMedia>
      )}
      <div className={styles.content}>
        <h2 className={styles.title}>{video.title}</h2>
      </div>
    </article>
  );
}
