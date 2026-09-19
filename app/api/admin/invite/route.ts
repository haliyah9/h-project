import { createClient as createSSRClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const supabase = await createSSRClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (!isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { email } = body;
    if (!email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { error: dbError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          role: "admin",
          department: "IT",
        },
        redirectTo: `${siteUrl}/invite`,
      },
    );
    if (dbError) {
      throw dbError;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Invite sent successfully.",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Invite error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
