import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const endpoint = url.pathname.split("/").pop();
  if (!endpoint) {
    throw new Error("Endpoint not found");
  }
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/statistics/${endpoint}`;

  try {
    const apiRes = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-secret-key": process.env.API_SECRET || "",
      },
      cache: "no-store",
    });

    if (apiRes.status === 204) {
      return new Response(null, { status: 204 });
    }

    if (!apiRes.ok) {
      const errorResponse = await apiRes.json();

      throw new Error(
        `API responded with status ${apiRes.status}: ${errorResponse.message}`,
      );
    }

    const data = await apiRes.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    let errorMessage = "Σφάλμα κατά την ανάκτηση δεδομένων";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
