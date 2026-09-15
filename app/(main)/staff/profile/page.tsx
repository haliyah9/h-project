import { createClient } from "@/utils/supabase/server";
import ProfileClientPage from "./ProfileClient";

const ProfilePage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error } = await supabase
    .from("profiles")

    .select("*")
    .eq("id", user?.id)
    .single();

  if (error) {
    return <div className="p-8 text-red-500">Failed to load profiles</div>;
  }
  return (
    <div>
      <ProfileClientPage profile={profile} email={user?.email} />
    </div>
  );
};

export default ProfilePage;
