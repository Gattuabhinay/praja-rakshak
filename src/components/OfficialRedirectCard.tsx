type OfficialRedirectCardProps = {
  name: string;
  description: string;
  url: string;
  recommended?: boolean;
  channelType?: "government-portal" | "whatsapp-official" | "helpline";
  onOpen?: () => void;
};

export function OfficialRedirectCard({
  name,
  description,
  url,
  recommended = false,
  channelType = "government-portal",
  onOpen,
}: OfficialRedirectCardProps) {
  const isWhatsApp = channelType === "whatsapp-official";
  const typeLabel = isWhatsApp
    ? "Official government WhatsApp"
    : channelType === "helpline"
      ? "Official helpline"
      : "Official government website";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`official-redirect ${recommended ? "recommended" : ""}`}
      onClick={onOpen}
    >
      <div className="official-redirect-top">
        <span className="official-pill">
          {isWhatsApp ? "OFFICIAL WHATSAPP" : "OFFICIAL REDIRECT"}
        </span>
        {recommended ? <span className="rec-pill">Recommended</span> : null}
      </div>
      <strong>{name}</strong>
      <p>{description}</p>
      <div className="official-redirect-meta">
        <span>{typeLabel}</span>
        <span className="leave-note">
          {isWhatsApp
            ? "You leave Praja Rakshak → open official government WhatsApp"
            : "You leave Praja Rakshak → open external government official site"}
        </span>
      </div>
      <span className="official-url">{url}</span>
      <span className="official-cta">
        {isWhatsApp
          ? "Open official WhatsApp →"
          : "Open external government official site →"}
      </span>
    </a>
  );
}
