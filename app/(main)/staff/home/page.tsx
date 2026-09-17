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
  return (
    <StaffHomeClientPage
      request={attachment || []}
      recentRequest={recentAttachment || []}
    />
  );
};

export default HomePage;
