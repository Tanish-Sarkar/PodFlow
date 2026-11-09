import { ImageResponse } from "next/og";
import { OgCard } from "@/lib/og-card";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME}: turn scattered sources into knowledge you can use`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<OgCard />, size);
}
