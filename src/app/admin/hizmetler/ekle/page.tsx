import { AdminForm } from "@/components/admin/AdminForm";
import ServiceFields from "@/components/admin/ServiceFields";
import { createService } from "../../actions";

export default function AddServicePage() {
  return (
    <AdminForm
      title="Yeni Hizmet Ekle"
      action={createService}
      submitLabel="Kaydet"
    >
      <ServiceFields />
    </AdminForm>
  );
}
