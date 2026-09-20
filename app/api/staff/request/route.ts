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

    const body = await request.json();
    const { title, format, fileUrl } = body;

    if (!title || !format || !fileUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { error: dbError } = await supabase.from("attachments").insert({
      user_id: user.id,
      title: title,
      requested_format: format,
      original_file_url: fileUrl,
    });
    if (dbError) {
      throw dbError;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Request successfully saved to database.",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Staff API error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
