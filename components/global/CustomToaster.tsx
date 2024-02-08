import { cn } from "@/lib/utils";
import { Transition } from "@headlessui/react";
import { useTheme } from "next-themes";
import { Fragment } from "react";
import toast, { Toaster, type ToasterProps } from "react-hot-toast";
import { BsFillXCircleFill } from "react-icons/bs";
import { FaCheckCircle } from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";

export const CustomToaster: React.FC<ToasterProps> = (props) => {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster {...props}>
      {(t) => (
        <Transition
          appear
          show={t.visible}
          as={Fragment}
          enter="transform transition-all ease-out duration-150"
          enterFrom="opacity-0 translate-y-5"
          enterTo="opacity-100 translate-y-0"
          leave="transition-all ease-in duration-150 transform"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-5"
        >
          <div
            className={cn(
              "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5",
              {
                "dark:bg-gray-800": resolvedTheme === "dark",
              },
            )}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {t.type === "success" ? (
                    <FaCheckCircle
                      className="h-6 w-6 text-green-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <BsFillXCircleFill
                      className="h-6 w-6 text-red-400"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p
                    className={cn("text-sm font-bold text-gray-900", {
                      "dark:text-gray-100": resolvedTheme === "dark",
                    })}
                  >
                    {t.type === "success" ? "Επιτυχία!" : "Σφάλμα!"}
                  </p>

                  <p
                    className={cn("mt-1 text-sm text-gray-500", {
                      "dark:text-gray-300": resolvedTheme === "dark",
                    })}
                  >
                    {t.message as string}
                  </p>
                </div>
                <div className="ml-4 flex flex-shrink-0">
                  <button
                    type="button"
                    className={cn(
                      "inline-flex rounded-full bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                      {
                        "text-white dark:bg-gray-800 dark:hover:text-gray-300":
                          resolvedTheme === "dark",
                      },
                    )}
                    onClick={() => toast.dismiss(t.id)}
                  >
                    <span className="sr-only">Κλείσιμο</span>
                    <FaCircleXmark className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      )}
    </Toaster>
  );
};
