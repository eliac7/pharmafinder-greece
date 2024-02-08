import ReactCountryFlag from "react-country-flag";
import BannerComponent from "./BannerComponent";
import { getCountryByIP } from "@/lib/utils";
import { ICountryByIP } from "@/lib/interfaces";

interface ILocationBannerCheckerProps {
  ip: string | null;
}

async function LocationBannerChecker({ ip }: ILocationBannerCheckerProps) {
  let country: ICountryByIP | string;

  console.log("ip", ip);

  country = ip ? await getCountryByIP(ip) : "";
  console.log("country", country);
  const { countryCode, countryName } =
    typeof country === "object"
      ? country
      : { countryCode: "", countryName: "" };

  console.log("countryCode", countryCode);
  console.log("countryName", countryName);

  const isGreece = countryCode === "GR";

  console.log("isGreece", isGreece);

  return (
    countryCode &&
    !isGreece && (
      <BannerComponent>
        <div className="text-md">
          We detect you are from {countryName}{" "}
          <span>
            <ReactCountryFlag countryCode={countryCode} svg />
          </span>
          . This website is designed for Greece. You can still use it, but some
          features may not be available.
        </div>
      </BannerComponent>
    )
  );
}

export default LocationBannerChecker;
