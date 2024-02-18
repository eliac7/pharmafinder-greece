import ReactCountryFlag from "react-country-flag";
import BannerComponent from "./BannerComponent";

interface ILocationBannerCheckerProps {
  countryCode: string;
  cityName: string;
}

async function LocationBannerChecker({
  countryCode,
  cityName,
}: ILocationBannerCheckerProps) {
  const isGreece = countryCode === "GR";

  return (
    countryCode &&
    !isGreece && (
      <BannerComponent>
        <div className="text-md">
          We detect you are from {cityName}{" "}
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
