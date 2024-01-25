import { NextRequest, NextResponse } from "next/server";
import { limiter } from "../../config/limiter";
import { encrypt } from "@/app/api/utils/cryptoUtils";

export async function GET(req: NextRequest) {
  console.log("Received GET request");

  const url = req.nextUrl;
  const endpoint = url.pathname.split("/").pop();
  const params = Object.fromEntries(url.searchParams);
  const secret = process.env.API_SECRET || "";
  const remaining = await limiter.removeTokens(1);
  const origin = req.headers.get("origin");

  console.log("Endpoint:", endpoint);
  console.log("Params:", params);
  console.log("Remaining tokens:", remaining);

  if (remaining < 1) {
    console.log("Rate limit exceeded");

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

  console.log("API URL:", apiUrl);

  try {
    const apiRes = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-secret-key": secret,
      },
    });

    console.log("API Response Status:", apiRes.status);

    if (apiRes.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    if (!apiRes.ok) {
      const errorResponse = await apiRes.json();

      console.log("API Error Response:", errorResponse);

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
    console.log("API Response Data:", data);

    const secretKey = process.env.NEXT_PUBLIC_CRYPTO_SECRET!;
    const encryptedData = encrypt(JSON.stringify(data), secretKey);

    console.log("Encrypted Data:", encryptedData);

    return NextResponse.json(encryptedData);
  } catch (error) {
    let errorMessage = "Σφάλμα κατά την ανάκτηση δεδομένων";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error("Error:", errorMessage);

    return new NextResponse(JSON.stringify({ message: errorMessage }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
