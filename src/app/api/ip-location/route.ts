import { NextRequest, NextResponse } from "next/server";

interface IpApiResponse {
  status: "success" | "fail";
  lat?: number;
  lon?: number;
  city?: string;
  regionName?: string;
  message?: string;
}

export async function GET(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || "";

    const isValidIp =
      clientIp && !clientIp.startsWith("127.") && !clientIp.startsWith("::1");
    const apiUrl = isValidIp
      ? `http://ip-api.com/json/${clientIp}?fields=status,message,lat,lon,city,regionName`
      : `http://ip-api.com/json/?fields=status,message,lat,lon,city,regionName`;

    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 },
    });

    const data: IpApiResponse = await response.json();

    if (data.status === "fail") {
      return NextResponse.json(
        { error: data.message || "IP geolocation failed" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      latitude: data.lat,
      longitude: data.lon,
      city: data.city,
      region: data.regionName,
    });
  } catch (error) {
    console.error("IP geolocation error:", error);
    return NextResponse.json(
      { error: "Failed to fetch location from IP" },
      { status: 500 },
    );
  }
}
