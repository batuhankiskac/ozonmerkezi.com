import AdminContentList from "@/components/admin/AdminContentList";
import { getServices } from "@/lib/content";
import { deleteService } from "../actions";

export default async function ServicesAdminPage() {
  const services = await getServices();
  return (
    <AdminContentList
      title="Hizmetler"
      addHref="/admin/hizmetler/ekle"
      addLabel="Yeni Hizmet Ekle"
      emptyText="Henüz eklenmiş bir hizmet yok."
      deleteAction={deleteService}
      items={services.map((service) => ({
        id: service.id,
        title: service.title,
        description: service.description,
        imageUrl: service.imageUrl,
        editHref: `/admin/hizmetler/duzenle/${service.id}`,
      }))}
    />
  );
}
