import { AdminForm } from "@/components/admin/AdminForm";
import VideoFields from "@/components/admin/VideoFields";
import { createVideo } from "../../actions";

export default function AddVideoPage() {
  return (
    <AdminForm
      title="Yeni Video Ekle"
      action={createVideo}
      submitLabel="Kaydet"
    >
      <VideoFields />
    </AdminForm>
  );
}
