import { Fragment, type ReactNode } from "react";
import ContentGrid from "@/components/ContentGrid";
import EmptyState from "@/components/EmptyState";

type PublicContentListProps<T extends { id: string }> = {
  load: () => Promise<T[]>;
  emptyText: string;
  // İkinci parametre ızgaradaki sıra; kartların kademeli açılması için.
  renderItem: (item: T, index: number) => ReactNode;
};

// Liste sayfalarının ortak kalıbı: veriyi yükler, kartları ızgarada gösterir,
// boşsa boş durum metnini yazar. Suspense sınırı çağıran sayfada kalır.
export default async function PublicContentList<T extends { id: string }>({
  load,
  emptyText,
  renderItem,
}: PublicContentListProps<T>) {
  const items = await load();

  return (
    <ContentGrid>
      {items.length > 0 ? (
        items.map((item, index) => (
          <Fragment key={item.id}>{renderItem(item, index)}</Fragment>
        ))
      ) : (
        <EmptyState>{emptyText}</EmptyState>
      )}
    </ContentGrid>
  );
}
