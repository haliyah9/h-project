import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const PATCH = async (request: Request) => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: "Missing Request Id" },
        { status: 400 },
      );
    }

    const { error: dbError } = await supabase
      .from("attachments")
      .update({
        status: "Cancelled",
      })
      .eq("id", requestId)
      .eq("user_id", user.id);
    if (dbError) {
      throw dbError;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Request cancelled successfully.",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Cancel API error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
