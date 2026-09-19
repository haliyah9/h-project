import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const supabase = await createClient();

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
    const { requestId, documentUrl } = body;

    if (!requestId || !documentUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { error: dbError } = await supabase
      .from("attachments")
      .update({
        status: "Resolved",
        document_url: documentUrl,
      })
      .eq("id", requestId);
    if (dbError) {
      throw dbError;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Document generated successfully and resolved.",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Admin API error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
