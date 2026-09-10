import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const CONTACT_TO = process.env.CONTACT_TO || "info@managementproperties.co.uk";
const FROM = process.env.CONTACT_FROM || "enquiries@yourdomain.com"; // must be verified in Resend

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!FROM) {
    return res.status(500).json({
      error: "CONTACT_FROM is not set or verified. In Resend, verify a sender/domain and set CONTACT_FROM."
    });
  }

  try {
    const { name, email, phone, message, ref, properties } = req.body || {};

    if (!name || (!email && !phone) || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const selectedProperties = Array.isArray(properties)
      ? properties
          .filter((property) => property && typeof property === "object")
          .map((property) => ({
            id: String(property.id ?? "").trim(),
            title: String(property.title ?? "").trim(),
            address: String(property.address ?? "").trim(),
          }))
          .filter((property) => property.id && property.title)
          .slice(0, 20)
      : [];

    const subject = selectedProperties.length === 1
      ? `Enquiry about ${selectedProperties[0].title} — ${name}`
      : selectedProperties.length > 1
        ? `Enquiry about ${selectedProperties.length} properties — ${name}`
        : ref
          ? `Enquiry about ${ref} — ${name}`
          : `New enquiry — ${name}`;
    const propertyLines = selectedProperties.length
      ? [
          "Properties:",
          ...selectedProperties.map((property) =>
            `- ${property.title}${property.address ? ` — ${property.address}` : ""} (Reference: ${property.id})`,
          ),
          "",
        ]
      : ref
        ? [`Reference: ${ref}`, ""]
        : [];
    const textLines = [
      `Name: ${name}`,
      email ? `Email: ${email}` : "",
      phone ? `Phone: ${phone}` : "",
      "",
      ...propertyLines,
      "Message:",
      message
    ].filter(Boolean);

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: CONTACT_TO,
      replyTo: email || undefined,
      subject,
      text: textLines.join("\n"),
    });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true, id: data?.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return res.status(500).json({ error: message });
  }
}
