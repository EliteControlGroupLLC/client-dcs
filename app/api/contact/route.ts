import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { pushLeadToBuildCore, type BuildCoreServiceLine } from "@/lib/buildcore-intake";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit check
  const ip = getClientIp(request);
  const limit = checkRateLimit(`contact:${ip}`, RATE_LIMITS.formSubmission);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(limit.resetAt),
        },
      }
    );
  }

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

    // Push into BuildCore CRM so the team sees it with every other lead.
    // Awaited (serverless may freeze fire-and-forget work); failures are
    // logged, never shown to the visitor — the submission is already saved.
    const [firstName, ...rest] = String(name).trim().split(/\s+/);
    const crm = await pushLeadToBuildCore({
      firstName: firstName || String(name),
      lastName: rest.join(" ") || "-",
      email,
      phone: phone && String(phone).replace(/\D/g, "").length >= 7 ? phone : "Not provided",
      propertyAddress: "Not provided",
      city: "Not provided",
      serviceLine: serviceLineFor(service),
      source: "website-contact",
      notes: [`Website contact form${service ? ` — ${service}` : ""}.`, "", String(message)].join("\n"),
    });
    if (!crm.success) {
      console.error("[CONTACT] BuildCore push failed:", JSON.stringify(crm));
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function serviceLineFor(service: unknown): BuildCoreServiceLine {
  const s = String(service ?? "").toLowerCase();
  if (s.includes("adu")) return "adu";
  if (s.includes("new home")) return "custom-home";
  if (s.includes("remodel") || s.includes("kitchen") || s.includes("bath")) return "remodel";
  if (s.includes("roof")) return "roofing";
  return "general-construction";
}
