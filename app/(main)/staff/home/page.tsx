import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

const StaffHomePage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (profileError) {
    console.log(profileError.message);
  }

  const { data: attachment, error: attachmentError } = await supabase
    .from("attachments")
    .select("*");
  if (attachmentError) {
    console.log(attachmentError.message);
  }

  const { data: recentAttachment, error: recentAttachmentError } =
    await supabase
      .from("attachments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);
  if (recentAttachmentError) {
    console.log(recentAttachmentError.message);
  }

  const totalAttachments = attachment?.length;
  const pendingAttachments = attachment?.filter(
    (att) => att.status === "Pending",
  ).length;
  const resolvedAttachments = attachment?.filter(
    (att) => att.status === "Resolved",
  ).length;
  const cancelledAttachments = attachment?.filter(
    (att) => att.status === "Cancelled",
  ).length;

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  return (
    <div>
      <div>
        <h1>
          Welcome <span>{profile.username}</span>
        </h1>
        <h3>
          <span>{profile.department}</span> {" - "} <span>{greeting}</span>
        </h3>
      </div>

      <div className="flex gap-4">
        <div>
          <h1>{totalAttachments}</h1>
          <h3>{totalAttachments === 0 ? "Total Request" : "Total Requests"}</h3>
        </div>
        <div>
          <h1>{pendingAttachments}</h1>
          <h3>
            {pendingAttachments === 0
              ? "No Pending Request"
              : "Pending Requests"}
          </h3>
        </div>
        <div>
          <h1>{resolvedAttachments}</h1>
          <h3>
            {resolvedAttachments === 0
              ? "No Resolved Request"
              : "Resolved Requests"}
          </h3>
        </div>
        <div>
          <h1>{cancelledAttachments}</h1>
          <h3>
            {cancelledAttachments === 0
              ? "No Cancelled Request"
              : "Cancelled Requests"}
          </h3>
        </div>
      </div>

      <div>
        <Link href="/staff/submit-requests">Submit Requests</Link>
      </div>

      <div>
        <h1>Recent Requests</h1>
        {recentAttachment?.map((req) => (
          <div key={req.id}>
            <h1>{req.title}</h1>
            <div>
              <p>{req.reference}</p>
              <p>{req.requested_format}</p>
            </div>
            <h3>{req.status}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffHomePage;
