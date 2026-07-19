import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** Browser tab favicon — official Telangana emblem on navy. */
export default async function Icon() {
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
          alignItems: "center",
          justifyContent: "center",
          background: "#1a2e4c",
        }}
      >
        <img
          src={emblemSrc}
          width={440}
          height={440}
          alt="Telangana"
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size },
  );
}
