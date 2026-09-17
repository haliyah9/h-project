import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import StaffHomeClientPage from "./StaffHomeClient";

const HomePage = async () => {
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
    supabase
      .from("attachments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("attachments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "Pending"),
    supabase
      .from("attachments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "Resolved"),
    supabase
      .from("attachments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "Cancelled"),
  ]);

  const { data: recentAttachment, error: recentAttachmentError } =
    await supabase
      .from("attachments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);
  if (recentAttachmentError) {
    console.log(recentAttachmentError.message);
  }
  return (
    <StaffHomeClientPage
      totalRequests={totalCount}
      pendingRequests={pendingCount}
      resolvedRequests={resolvedCount}
      cancelledRequests={cancelledCount}
      recentRequest={recentAttachment || []}
    />
  );
};

export default HomePage;
