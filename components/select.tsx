"use client";

import { Fragment, useState, useEffect } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { FaChevronCircleDown } from "react-icons/fa";

import cities from "@/data/options.json";
import { redirect } from "next/navigation";

interface Option {
  label: string;
  value: string;
}

export default function Select() {
  const [selected, setSelected] = useState<Option>({
    label: "Επιλεξτε πόλη...",
    value: "",
  });
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (selected.value !== "") {
      redirect(`/city/${selected.value}`);
    }
  }, [selected]);

  const normalizeText = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredOptions =
    query === ""
      ? cities
      : cities.filter((option) =>
          normalizeText(option.label).includes(normalizeText(query)),
        );

  return (
    <div>
      <Combobox value={selected} onChange={setSelected}>
        <div className="relative mt-1">
          <div className="sm:text-sm relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 placeholder-gray-500 focus:ring-0 dark:text-gray-300"
              displayValue={(option: Option) => option.label}
              onChange={(event) => setQuery(event.target.value)}
              onClick={() => setSelected({ label: "", value: "" })}
            />

            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
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
            <Combobox.Options className="sm:text-sm absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none">
              {filteredOptions.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  Δεν βρέθηκαν αποτελέσματα
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <Combobox.Option
                    key={option.value}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active
                          ? "bg-complementary-400 text-white"
                          : "text-gray-900 dark:bg-gray-800 dark:text-gray-300"
                      }`
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {option.label}
                        </span>
                      </>
                    )}
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
