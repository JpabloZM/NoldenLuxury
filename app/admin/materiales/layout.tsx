import AdminLayout from "@/app/admin/components/AdminLayout";

export default function MaterialesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
