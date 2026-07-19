"use client";

import { OfficialRedirectCard } from "@/components/OfficialRedirectCard";
import { JourneyStrip } from "@/components/JourneyStrip";
import { TelanganaBadge } from "@/components/TelanganaBadge";
import { BRAND } from "@/lib/brand";
import { HELPLINES, TELANGANA_PORTALS } from "@/lib/telangana";
import {
  buildOfficialWhatsAppUrl,
  WHATSAPP_CHANNELS,
} from "@/lib/whatsapp";

export function PortalsSection() {
  return (
    <section className="panel">
      <div className="tg-section-head">
        <TelanganaBadge size="md" showLabel />
      </div>
      <p className="eyebrow">Official Portal · {BRAND.state}</p>
      <h1>File on government official websites</h1>
      <JourneyStrip active="portals" authed />
      <div className="redirect-banner">
        <strong>OFFICIAL REDIRECT</strong>
        <p>
          You leave Praja Rakshak and open a real government official site to file
          the case.
        </p>
      </div>
      <div className="official-grid">
        {TELANGANA_PORTALS.map((portal) => (
          <OfficialRedirectCard
            key={portal.id}
            name={portal.name}
            description={portal.description}
            url={portal.url}
            recommended={
              portal.id === "ghmc-igs" ||
              portal.id === "acb" ||
              portal.id === "lokayukta" ||
              portal.id === "cybercrime" ||
              portal.id === "women-safety-wing" ||
              portal.id === "she-box"
            }
            channelType="government-portal"
          />
        ))}
        {WHATSAPP_CHANNELS.map((channel) => (
          <OfficialRedirectCard
            key={channel.id}
            name={channel.label}
            description={`${channel.note} Number: ${channel.number}. Use for ${
              channel.authority === "GHMC"
                ? "waste / sanitation cases"
                : channel.authority === "ACB"
                  ? "bribery / corruption cases"
                  : "women safety / harassment cases"
            }.`}
            url={buildOfficialWhatsAppUrl(
              channel,
              channel.authority === "GHMC"
                ? "Official GHMC grievance from Praja Rakshak (waste / sanitation)."
                : channel.authority === "ACB"
                  ? "Official ACB grievance from Praja Rakshak (bribery / corruption)."
                  : "Official SHE Teams women-safety complaint from Praja Rakshak.",
            )}
            recommended
            channelType="whatsapp-official"
          />
        ))}
        {HELPLINES.map((line) => (
          <OfficialRedirectCard
            key={line.id}
            name={`${line.label}: ${line.value}`}
            description={line.note}
            url={line.href}
            channelType="helpline"
          />
        ))}
      </div>
    </section>
  );
}
