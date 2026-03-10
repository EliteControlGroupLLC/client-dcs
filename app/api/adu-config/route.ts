import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      contact_info,
      property_info,
      adu_type,
      square_feet,
      bedrooms,
      bathrooms,
      style,
      features,
      upgrades,
      estimated_price_low,
      estimated_price_high,
    } = body;

    // Validate required fields
    if (!contact_info?.email || !contact_info?.name) {
      return NextResponse.json(
        { error: "Contact information is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Save the ADU configuration
    const { data: configData, error: configError } = await supabase
      .from("adu_configurations")
      .insert({
        property_address: property_info?.address,
        lot_size: property_info?.lot_size,
        adu_type,
        square_feet,
        bedrooms,
        bathrooms,
        style,
        features,
        upgrades,
        estimated_price_low,
        estimated_price_high,
      })
      .select()
      .single();

    if (configError) {
      console.error("Error saving ADU configuration:", configError);
      return NextResponse.json(
        { error: "Failed to save configuration" },
        { status: 500 }
      );
    }

    // Create a lead from this configuration
    const { error: leadError } = await supabase.from("leads").insert({
      name: contact_info.name,
      email: contact_info.email,
      phone: contact_info.phone,
      property_address: property_info?.address,
      service_type: "ADU",
      source: "build_your_adu",
      status: "new",
      message: `ADU Configuration: ${adu_type}, ${square_feet} sq ft, ${bedrooms} bed, ${bathrooms} bath. Estimated: $${estimated_price_low?.toLocaleString()} - $${estimated_price_high?.toLocaleString()}`,
    });

    if (leadError) {
      console.error("Error creating lead:", leadError);
    }

    return NextResponse.json({ 
      success: true, 
      data: configData,
      message: "Your ADU configuration has been saved. We'll be in touch soon!" 
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
