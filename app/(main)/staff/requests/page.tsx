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
    .order("created_at", { ascending: true });

  if (error) {
    return <div className="p-8 text-red-500">Failed to load attachments.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            My Requests
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Track the status of your document requests
          </p>
        </div>

        <Link href="/staff/submit-requests">+ New Request</Link>
      </div>
      <RequestClient initialRequests={attachments || []} />
    </div>
  );
};

export default RequestPage;
