import { notFound } from "next/navigation";
import { AdminForm } from "@/components/admin/AdminForm";
import ServiceFields from "@/components/admin/ServiceFields";
import { getService } from "@/lib/content";
import { updateService } from "../../../actions";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getService(id);
  if (!service) notFound();

  return (
    <AdminForm
      title="Hizmeti Düzenle"
      action={updateService.bind(null, id)}
      submitLabel="Güncelle"
    >
      <ServiceFields service={service} />
    </AdminForm>
  );
}
