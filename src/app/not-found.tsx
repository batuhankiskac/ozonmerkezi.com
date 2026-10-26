import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFoundContent from "@/components/NotFoundContent";

// Eşleşmeyen URL'ler (site) düzenine girmez; başlık ve alt bilgi burada eklenir.
export default function RootNotFound() {
  return (
    <>
      <Header />
      <NotFoundContent />
      <Footer />
    </>
  );
}
