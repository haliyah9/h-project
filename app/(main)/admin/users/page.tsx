import { createClient } from "@/utils/supabase/server";
import UserClientPage from "./UserClientPage";

const UserPage = async () => {
  const supabase = await createClient();

  const { data: users } = await supabase.from("profiles").select("*");
  return <UserClientPage users={users || []} />;
};

export default UserPage;
