// Analytics event tracking for GTM dataLayer and Meta Pixel
// Fires conversion events for key user actions across the site.

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    fbq: (...args: unknown[]) => void;
  }
}

/**
 * Push an event to the GTM dataLayer
 */
function pushToDataLayer(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...data });
}

/**
 * Fire a Meta Pixel event
 */
function fireMetaPixelEvent(eventName: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (data) {
    window.fbq("track", eventName, data);
  } else {
    window.fbq("track", eventName);
  }
}

// ─── Public Conversion Events ───

/**
 * User completed a property scan
 */
export function trackScanCompleted(address: string, confidenceScore: number) {
  pushToDataLayer("scan_completed", {
    property_address: address,
    confidence_score: confidenceScore,
  });
  fireMetaPixelEvent("Search", {
    search_string: address,
    content_category: "property_scan",
  });
}

/**
 * User submitted lead capture form (property report)
 */
export function trackLeadSubmitted(source: string, propertyAddress?: string) {
  pushToDataLayer("lead_submitted", {
    lead_source: source,
    property_address: propertyAddress || "",
  });
  fireMetaPixelEvent("Lead", {
    content_name: source,
    content_category: "lead_capture",
  });
}

/**
 * User submitted contact form
 */
export function trackContactFormSubmitted(service?: string) {
  pushToDataLayer("contact_form_submitted", {
    service_interested: service || "",
  });
  fireMetaPixelEvent("Contact", {
    content_category: "contact_form",
  });
}

/**
 * User clicked "Book Free Property Review" CTA
 */
export function trackBookingCTAClicked(location: string) {
  pushToDataLayer("booking_cta_clicked", {
    cta_location: location,
  });
  fireMetaPixelEvent("Schedule", {
    content_category: "booking",
  });
}

/**
 * User used a planning tool / calculator
 */
export function trackToolUsed(toolName: string) {
  pushToDataLayer("tool_used", {
    tool_name: toolName,
  });
  fireMetaPixelEvent("ViewContent", {
    content_name: toolName,
    content_category: "planning_tool",
  });
}

/**
 * User requested instant estimate
 */
export function trackInstantEstimate(aduType?: string, estimatedCost?: number) {
  pushToDataLayer("instant_estimate_requested", {
    adu_type: aduType || "",
    estimated_cost: estimatedCost || 0,
  });
  fireMetaPixelEvent("InitiateCheckout", {
    content_category: "estimate",
    value: estimatedCost || 0,
    currency: "USD",
  });
}

/**
 * User viewed a service page
 */
export function trackServicePageViewed(serviceName: string) {
  pushToDataLayer("service_page_viewed", {
    service_name: serviceName,
  });
  fireMetaPixelEvent("ViewContent", {
    content_name: serviceName,
    content_category: "service",
  });
}
