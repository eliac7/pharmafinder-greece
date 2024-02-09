"use client";

import { IPharmacy } from "@/lib/interfaces";

interface IPharmacyListIsClosingSoon {
  pharmacy: IPharmacy;
}

const PharmacyListIsClosingSoon: React.FC<IPharmacyListIsClosingSoon> = ({
  pharmacy,
}) => {
  const isClosingSoon = (pharmacy: IPharmacy) => {
    const now = new Date();
    const closingSoonThreshold = 60;
    let isClosingSoon = false;
    let message = "";

    if (pharmacy.data_hours) {
      pharmacy.data_hours.forEach((session) => {
        const closeTimeToday = new Date(
          `${pharmacy.date}T${session.close_time}`,
        );
        const minutesUntilClosing =
          (closeTimeToday.getTime() - now.getTime()) / 60000;

        if (
          minutesUntilClosing > 0 &&
          minutesUntilClosing <= closingSoonThreshold
        ) {
          isClosingSoon = true;
          message = `Κλείνει σε λίγο στις ${session.close_time}`;
        }
      });
    } else {
      message = "Οι ώρες λειτουργίας δεν είναι διαθέσιμες.";
    }

    return { isClosingSoon, message };
  };

  const { isClosingSoon: closingSoon, message } = isClosingSoon(pharmacy);

  return (
    <div>
      {closingSoon && (
        <div className="my-2 rounded-full  bg-slate-600 p-1 px-2 text-sm font-bold text-white dark:bg-slate-300 dark:text-alert-error ">
          {message}
        </div>
      )}
    </div>
  );
};

export default PharmacyListIsClosingSoon;
