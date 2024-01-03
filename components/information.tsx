"use client";
import { IoIosInformationCircle } from "react-icons/io";
import { useRef, useEffect, useState } from "react";

function Information() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        className="absolute bottom-2 right-2 z-[9998] flex cursor-pointer items-center justify-center rounded-full bg-complementary-600 p-2 transition-all duration-300 hover:bg-complementary-500"
        onClick={() => setIsModalOpen(true)}
      >
        <IoIosInformationCircle size={20} color="white" />
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-4" ref={modalRef}>
            <h1 className="text-2xl font-semibold">Πληροφορίες</h1>
            <p className="text-lg">
              Το PharmaFinder είναι μια δωρεάν υπηρεσία που σας βοηθάει να
              βρείτε το φαρμακείο που είναι ανοιχτό κοντά σας.
            </p>
            <p className="text-lg">
              Το PharmaFinder δεν συνδέεται με κανένα φαρμακείο και δεν
              ευθύνεται για την ακρίβεια των δεδομένων που παρέχει.
            </p>
            <p className="text-lg">
              Τα δεδομένα που παρέχει το PharmaFinder προέρχονται από τον ΕΟΦ
              και τον ΕΟΠΥΥ.
            </p>
            <p className="text-lg">
              Το PharmaFinder δεν συλλέγει κανένα προσωπικό δεδομένο και δεν
              χρησιμοποιεί cookies.
            </p>
            <p className="text-lg">
              Το PharmaFinder είναι ένα project ανοιχτού κώδικα και ο κώδικας
              του είναι διαθέσιμος στο{" "}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                GitHub
              </a>
            </p>
            <button
              className="mt-4 rounded-lg bg-complementary-600 p-2 text-white hover:bg-complementary-500"
              onClick={() => setIsModalOpen(false)}
            >
              Κλείσιμο
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Information;
