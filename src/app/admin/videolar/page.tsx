import AdminContentList from "@/components/admin/AdminContentList";
import { getVideos } from "@/lib/content";
import { videoThumbnail } from "@/lib/youtube";
import { deleteVideo } from "../actions";

export default async function VideosAdminPage() {
  const videos = await getVideos();
  return (
    <AdminContentList
      title="Videolar"
      addHref="/admin/videolar/ekle"
      addLabel="Yeni Video Ekle"
      emptyText="Henüz eklenmiş bir video yok."
      deleteAction={deleteVideo}
      items={videos.map((video) => ({
        id: video.id,
        title: video.title,
        imageUrl: videoThumbnail(video),
      }))}
    />
  );
}
