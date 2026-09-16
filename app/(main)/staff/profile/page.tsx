import { createClient } from "@/utils/supabase/server";
import ProfileClientPage from "./ProfileClient";
import { redirect } from "next/navigation";

const ProfilePage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/");
  }

  const { data: profile, error } = await supabase
    .from("profiles")

    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return <div className="p-8 text-red-500">Failed to load profiles</div>;
  }
  return (
    <div>
      <ProfileClientPage profile={profile} email={user.email} />
    </div>
  );
};

export default ProfilePage;
