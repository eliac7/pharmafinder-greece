"use client";
import { IoIosInformationCircle } from "react-icons/io";
import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useTheme } from "next-themes";

function Information() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useTheme();

  function closeModal() {
    setIsModalOpen(false);
  }

  return (
    <>
      <div
        className="flex cursor-pointer items-center justify-center rounded-full p-2 shadow-xl transition-all duration-300 hover:bg-complementary-500"
        onClick={() => setIsModalOpen(true)}
      >
        <IoIosInformationCircle
          size={22}
          color={theme === "dark" ? "#fff" : "#3F4045"}
        />
      </div>

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[1001]" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-900">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Τι είναι το PharmaFinder;
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      Το PharmaFinder είναι μια δωρεάν υπηρεσία που σας
                      επιτρέπει να βρείτε το φαρμακείο που είναι ανοιχτό στην
                      περιοχή σας αυτή τη στιγμή.
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Κλείσιμο
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default Information;
