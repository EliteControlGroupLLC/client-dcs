import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, service, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("contact_submissions")
      .insert({
        name,
        email,
        phone,
        service_interested: service,
        message,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating contact submission:", error);
      return NextResponse.json(
        { error: "Failed to submit message" },
        { status: 500 }
      );
    }

    // Also create a lead from the contact form
    await supabase.from("leads").insert({
      name,
      email,
      phone,
      service_type: service,
      message,
      source: "contact_form",
      status: "new",
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
