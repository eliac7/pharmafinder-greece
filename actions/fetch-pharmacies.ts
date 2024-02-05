import { decrypt } from "@/app/api/utils/cryptoUtils";
import { IPharmacyResponse } from "@/lib/interfaces";

export const fetchPharmacies = async (
  endpoint: string,
  params: { [key: string]: string },
): Promise<IPharmacyResponse> => {
  const query = new URLSearchParams(params).toString();
  const url = `/api/pharmacies/${endpoint}?${query}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorResponse = await response.json();
    if (errorResponse.message) {
      throw new Error(errorResponse.message);
    }
    throw new Error("Error fetching data");
  }

  const encryptedData = await response.json();

  const secretKey = process.env.NEXT_PUBLIC_CRYPTO_SECRET!;
  const decryptedData = decrypt(encryptedData, secretKey);

  return JSON.parse(decryptedData);
};
