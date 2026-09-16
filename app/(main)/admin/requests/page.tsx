import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AllRequestsClientPage from "./RequestClientPage";

const AllRequestsPage = async () => {
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
    .order("created_at", { ascending: true });
  if (error) {
    return <div className="p-8 text-red-500">Failed to load attachments.</div>;
  }

  return <AllRequestsClientPage requests={attachments} />;
};

export default AllRequestsPage;
