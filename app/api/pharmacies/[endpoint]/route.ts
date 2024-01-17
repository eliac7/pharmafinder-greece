import { NextRequest, NextResponse } from "next/server";
import { limiter } from "../../config/limiter";
import { encrypt } from "@/app/api/utils/cryptoUtils";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const endpoint = url.pathname.split("/").pop();
  const params = Object.fromEntries(url.searchParams);
  const secret = process.env.API_SECRET || "";
  const remaining = await limiter.removeTokens(1);
  const origin = req.headers.get("origin");

  if (remaining < 1) {
    const body = JSON.stringify({
      message: "Υπερβολικός αριθμός αιτημάτων, παρακαλώ δοκίμαστε σε λίγο",
    });

    return new NextResponse(body, {
      status: 429,
      statusText: "Too Many Requests",
      headers: {
        "Retry-After": "60",
        "Access-Control-Allow-Origin": origin || "*", // CORS
        "Content-Type": "plain/text",
      },
    });
  }

  const query = new URLSearchParams(params).toString();
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${endpoint}?${query}`;

  try {
    const apiRes = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-secret-key": secret,
      },
    });

    if (apiRes.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    if (!apiRes.ok) {
      const errorResponse = await apiRes.json();

      if (apiRes.status === 404) {
        return new NextResponse(
          JSON.stringify({ message: errorResponse.message }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      throw new Error(
        `API responded with status ${apiRes.status}: ${errorResponse.message}`,
      );
    }

    const data = await apiRes.json();
    const secretKey = process.env.NEXT_PUBLIC_CRYPTO_SECRET!;
    const encryptedData = encrypt(JSON.stringify(data), secretKey);

    return NextResponse.json(encryptedData);
  } catch (error) {
    let errorMessage = "Σφάλμα κατά την ανάκτηση δεδομένων";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new NextResponse(JSON.stringify({ message: errorMessage }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
