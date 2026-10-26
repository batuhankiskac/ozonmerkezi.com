import Image from "next/image";
import Link from "next/link";
import type { FormState } from "@/app/admin/actions";
import DeleteContentForm from "./DeleteContentForm";
import styles from "./AdminContentList.module.css";

interface AdminListItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string | null;
  editHref?: string;
}

interface AdminContentListProps {
  title: string;
  addHref: string;
  addLabel: string;
  emptyText: string;
  items: AdminListItem[];
  deleteAction: (id: string) => Promise<FormState>;
}

export default function AdminContentList({
  title,
  addHref,
  addLabel,
  emptyText,
  items,
  deleteAction,
}: AdminContentListProps) {
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <Link href={addHref} className={styles.addButton}>
          {addLabel}
        </Link>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <article key={item.id} className={styles.listItem}>
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt=""
                  width={120}
                  height={80}
                  className={styles.thumbnail}
                  sizes="120px"
                />
              )}
              <div className={styles.content}>
                <h2>{item.title}</h2>
                {item.description && <p>{item.description}</p>}
              </div>
              <div className={styles.actions}>
                {item.editHref && (
                  <Link href={item.editHref} className={styles.editButton}>
                    Düzenle
                  </Link>
                )}
                <DeleteContentForm id={item.id} deleteAction={deleteAction} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
