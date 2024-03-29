"use client";
import { FaqData } from "@/data/FAQ";
import clsx from "clsx";
import { useState } from "react";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";

function FAQ() {
  const [selected, setSelected] = useState<number>(0);
  const [isShowFullFAQ, setIsShowFullFAQ] = useState<boolean>(false);

  const handleSelect = (index: number) => {
    if (selected === index) {
      return setSelected(-1);
    }

    setSelected(index);
  };

  return (
    <section className="bg-gray-900">
      <div className="container mx-auto flex h-full w-full flex-col items-center justify-center gap-y-6 py-5 text-center text-white">
        <h1 className="py-2 text-center text-2xl font-bold text-white">
          Συχνές ερωτήσεις
        </h1>

        <div className="mt-6 space-y-4 px-2 tablet:px-0">
          {FaqData.slice(0, isShowFullFAQ ? FaqData.length : 3).map(
            (item, index) => (
              <div className="rounded-lg border-2 border-gray-700" key={index}>
                <button
                  className="flex w-full items-center justify-between gap-x-2 p-4 focus-visible:outline-none"
                  onClick={() => handleSelect(index)}
                >
                  <h1 className="stext-white text-left font-semibold">
                    {item.question}
                  </h1>

                  <span className="rounded-full bg-gray-200 text-black">
                    {selected === index ? (
                      <CiCircleMinus size={30} />
                    ) : (
                      <CiCirclePlus size={30} />
                    )}
                  </span>
                </button>

                <p
                  className={clsx(
                    "overflow-hidden text-left text-sm text-gray-300 transition-all duration-500 ease-in-out",
                    {
                      "h-0 opacity-0": selected !== index,
                      "h-auto p-4 opacity-100": selected === index,
                    },
                  )}
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              </div>
            ),
          )}
        </div>
        <button
          onClick={() => setIsShowFullFAQ(!isShowFullFAQ)}
          className="rounded-md bg-complementary-600 !p-4 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors  hover:bg-complementary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complementary-200"
        >
          {isShowFullFAQ ? "Δείτε λιγότερες" : "Δείτε περισσότερες"}
        </button>
      </div>
    </section>
  );
}

export default FAQ;
