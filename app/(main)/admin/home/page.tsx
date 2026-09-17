import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AdminHomeClient from "./AdminHomeClient";

const AdminHomePage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/");
  }

  const [
    { count: totalCount },
    { count: pendingCount },
    { count: resolvedCount },
    { count: cancelledCount },
  ] = await Promise.all([
    supabase.from("attachments").select("*", { count: "exact", head: true }),
    supabase
      .from("attachments")
      .select("*", { count: "exact", head: true })
      .eq("status", "Pending"),
    supabase
      .from("attachments")
      .select("*", { count: "exact", head: true })
      .eq("status", "Resolved"),
    supabase
      .from("attachments")
      .select("*", { count: "exact", head: true })
      .eq("status", "Cancelled"),
  ]);

  const { data: urgentRequests } = await supabase
    .from("attachments")
    .select("id, reference, title, requested_format, created_at")
    .eq("status", "Pending")
    .order("created_at", { ascending: true })
    .limit(5);
  return (
    <AdminHomeClient
      totalRequests={totalCount}
      pendingRequests={pendingCount}
      resolvedRequests={resolvedCount}
      cancelledRequests={cancelledCount}
      urgentRequests={urgentRequests || []}
    />
  );
};

export default AdminHomePage;
