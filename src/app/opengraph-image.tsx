import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt =
  "Praja Rakshak · Official Government of Telangana emblem · Clean Up + Speak Up";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const emblemPath = join(process.cwd(), "public", "brand", "telangana-emblem.png");
  const emblemData = await readFile(emblemPath);
  const emblemSrc = `data:image/png;base64,${emblemData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0f2744 0%, #1a2e4c 45%, #163a28 100%)",
          color: "#ffffff",
          fontFamily: "Georgia, serif",
        }}
      >
        <img
          src={emblemSrc}
          width={260}
          height={260}
          alt="Government of Telangana"
          style={{
            objectFit: "contain",
            marginBottom: 28,
          }}
        />
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: -1,
            lineHeight: 1.1,
          }}
        >
          Praja Rakshak
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 28,
            opacity: 0.92,
            fontFamily: "sans-serif",
          }}
        >
          Government of Telangana · Clean Up + Speak Up
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 22,
            opacity: 0.75,
            fontFamily: "sans-serif",
          }}
        >
          Social Impact AI for citizens
        </div>
      </div>
    ),
    { ...size },
  );
}
