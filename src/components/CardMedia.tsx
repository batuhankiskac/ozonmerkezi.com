import Image from "next/image";
import type { ReactNode } from "react";
import cardStyles from "../styles/card.module.css";

// Kartlar 1, 2 veya 3 sütunda; görselin gerçek genişliğine yakın boyut seçilir.
const SIZES = "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 400px";

type CardMediaProps = {
  src?: string | null;
  className?: string;
  children?: ReactNode;
  // Verilirse medya tıklanabilir buton olarak render edilir (video önizlemesi).
  onClick?: () => void;
  buttonLabel?: string;
};

export default function CardMedia({
  src,
  className,
  children,
  onClick,
  buttonLabel,
}: CardMediaProps) {
  const classes = [cardStyles.imageContainer, className]
    .filter(Boolean)
    .join(" ");
  const content = (
    <>
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          className={cardStyles.image}
          sizes={SIZES}
        />
      ) : null}
      {children}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onClick}
        aria-label={buttonLabel}
      >
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}
