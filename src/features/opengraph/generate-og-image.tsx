import { ImageResponse } from "next/og";

interface GenerateOgImageProps {
  title: string;
  subtitle?: string;
  type?: "city" | "pharmacy" | "generic";
  badge?: {
    text: string;
    active?: boolean;
    color?: string;
  };
  logoBase64: string;
  fonts?: {
    name: string;
    data: ArrayBuffer;
    weight: 400 | 700;
    style: "normal";
  }[];
}

export const alt = "PharmaFinder Greece - Εφημερεύοντα Φαρμακεία";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export function generateOgImage({
  title,
  subtitle,
  type = "generic",
  badge,
  logoBase64,
  fonts,
}: GenerateOgImageProps) {
  const isPharmacy = type === "pharmacy";
  const isCity = type === "city";

  let headline = "Εφημερεύοντα Φαρμακεία";
  let description =
    "Αναζητήστε, συγκρίνετε και βρείτε άμεσα ανοιχτά φαρμακεία κοντά σας με ακριβή δεδομένα.";
  let cardTitle = "Επισκόπηση";
  let row1Label = "Περιοχή";
  let row2Label = "Ημερομηνία";
  let row3Label = "Κατάσταση";

  if (isPharmacy) {
    headline = "Στοιχεία Φαρμακείου";
    description = `Βρείτε άμεσα πληροφορίες, χάρτη και οδηγίες πλοήγησης για το φαρμακείο ${title}.`;
    cardTitle = "Κάρτα Φαρμακείου";
    row1Label = "Επωνυμία";
    row2Label = "Διεύθυνση / Πληροφορίες";
    row3Label = "Κατάσταση Συστήματος";
  } else if (isCity) {
    headline = "Εφημερεύοντα Φαρμακεία";
    description = `Δείτε όλα τα εφημερεύοντα φαρμακεία για την περιοχή ${title}. Άμεση ενημέρωση και χάρτης.`;
    cardTitle = "Επισκόπηση Περιοχής";
    row1Label = "Περιοχή";
    row2Label = "Ημερομηνία";
    row3Label = "Πληρότητα Δεδομένων";
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f8fafc",
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          fontFamily: fonts ? '"Inter"' : "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 80px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "55%",
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <img src={logoBase64} width="48" height="48" alt="Logo" />
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#0f766e",
                  letterSpacing: "-0.02em",
                }}
              >
                Pharmafinder
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: "56px",
                  fontWeight: 400,
                  color: "#1e293b",
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                }}
              >
                {headline}
              </div>
              <div
                style={{
                  fontSize: "50px",
                  fontWeight: 700,
                  color: "#0d9488",
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  marginTop: "8px",
                }}
              >
                {title}
              </div>
            </div>

            <div
              style={{
                fontSize: "24px",
                color: "#64748b",
                lineHeight: 1.5,
                marginTop: "10px",
                maxWidth: "90%",
              }}
            >
              {description}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "40px",
                marginTop: "40px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#0f766e",
                  }}
                >
                  Live
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  Ενημέρωση
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#0f766e",
                  }}
                >
                  24/7
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  Πρόσβαση
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#0f766e",
                  }}
                >
                  100%
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  Δωρεάν
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "500px",
              backgroundColor: "white",
              borderRadius: "24px",
              padding: "32px",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              border: "1px solid #e2e8f0",
              transform: "rotate(-2deg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "32px",
              }}
            >
              <div
                style={{ fontSize: "20px", fontWeight: 600, color: "#1e293b" }}
              >
                {cardTitle}
              </div>
              {badge && (
                <div
                  style={{
                    backgroundColor: badge.active ? "#d1fae5" : "#f1f5f9",
                    color: badge.active ? "#059669" : "#64748b",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {badge.text}
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#94a3b8",
                  marginBottom: "6px",
                }}
              >
                {row1Label}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 600,
                  color: "#1e293b",
                }}
              >
                {title}
              </div>
              <div
                style={{
                  height: "4px",
                  width: "60%",
                  backgroundColor: "#0d9488",
                  marginTop: "12px",
                  borderRadius: "2px",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#94a3b8",
                  marginBottom: "6px",
                }}
              >
                {row2Label}
              </div>
              <div
                style={{ fontSize: "18px", color: "#334155", fontWeight: 500 }}
              >
                {subtitle ||
                  (isPharmacy ? "Διαθέσιμο στον χάρτη" : "Σημερινή Εφημερία")}
              </div>
              <div
                style={{
                  height: "4px",
                  width: "40%",
                  backgroundColor: "#5eead4",
                  marginTop: "12px",
                  borderRadius: "2px",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "14px",
                  color: "#94a3b8",
                  marginBottom: "6px",
                }}
              >
                {row3Label}
              </div>
              <div
                style={{
                  height: "4px",
                  width: "85%",
                  backgroundColor: "#2dd4bf",
                  marginTop: "8px",
                  borderRadius: "2px",
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            height: "80px",
            width: "100%",
            backgroundColor: "#0f766e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              color: "white",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            pharmafinder.gr
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts
        ? fonts.map((f) => ({
            name: f.name,
            data: f.data,
            weight: f.weight,
            style: f.style,
          }))
        : undefined,
    }
  );
}
