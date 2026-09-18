import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import RequestClient from "./RequestClient";

export const dynamic = "force-dynamic";

const RequestPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/");
  }

  const { data: attachments, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return <div className="p-8 text-red-500">Failed to load attachments.</div>;
  }

  return <RequestClient initialRequests={attachments || []} />;
};

export default RequestPage;
