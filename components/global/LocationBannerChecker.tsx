import ReactCountryFlag from "react-country-flag";
import BannerComponent from "./BannerComponent";

interface ILocationBannerCheckerProps {
  countryCode: string;
  countryName: string;
}

async function LocationBannerChecker({
  countryCode,
  countryName,
}: ILocationBannerCheckerProps) {
  const isGreece = countryCode === "GR";

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
