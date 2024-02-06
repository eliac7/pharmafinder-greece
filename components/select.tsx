"use client";

import { Combobox, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { FaChevronCircleDown } from "react-icons/fa";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  options: Option[];
  initialSelection?: Option;
  onChange?: (option: Option) => void;
  searchable?: boolean;
}

export default function Select({
  options,
  initialSelection = { label: "Επιλέξτε μια επιλογή...", value: "" },
  onChange,
  searchable = true,
}: SelectProps) {
  const [selected, setSelected] = useState<Option>(initialSelection);
  const [query, setQuery] = useState("");
  const comboboxButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSelected(initialSelection);
  }, [initialSelection]);

  useEffect(() => {
    if (onChange) {
      onChange(selected);
    }
  }, [selected, onChange]);

  const normalizeText = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) =>
          normalizeText(option.label).includes(normalizeText(query)),
        );

  return (
    <div className="w-full tablet:w-fit">
      <Combobox value={selected} onChange={setSelected}>
        <div className="relative">
          <div className="sm:text-sm relative w-full cursor-default overflow-hidden rounded-lg border border-primary-700 bg-white text-center shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 dark:bg-slate-600 tablet:text-left">
            {searchable ? (
              <Combobox.Input
                className="w-full truncate border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 focus:ring-transparent active:bg-transparent dark:text-gray-300
                "
                displayValue={(option: Option) => option.label}
                onChange={(event) => setQuery(event.target.value)}
                onClick={() => {
                  setSelected({ label: "", value: "" });
                  comboboxButtonRef.current?.click();
                }}
              />
            ) : (
              <Combobox.Button>
                <div className="h-full w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-gray-300 ">
                  {selected.label}
                </div>
              </Combobox.Button>
            )}

            <Combobox.Button
              ref={comboboxButtonRef}
              className="absolute inset-y-0 right-0 flex items-center pr-2"
            >
              <FaChevronCircleDown className="h-5 w-5 text-gray-400" />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options
              className="sm:text-sm absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 scrollbar scrollbar-track-gray-100 scrollbar-thumb-gray-300 focus:outline-none dark:bg-slate-800 dark:scrollbar-track-gray-600 dark:scrollbar-thumb-primary-400 tablet:w-fit
            "
            >
              {filteredOptions.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700 dark:text-gray-300">
                  Δεν βρέθηκαν αποτελέσματα
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <Combobox.Option
                    key={option.value}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-4 pr-4 text-center tablet:text-left ${
                        active
                          ? "bg-complementary-400 text-white"
                          : "text-gray-900 dark:bg-gray-800 dark:text-gray-300"
                      }`
                    }
                    value={option}
                  >
                    <span className={"block cursor-pointer truncate text-sm"}>
                      {option.label}
                    </span>
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
}
