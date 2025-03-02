"use client";

import { useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";

export const HowToPlayModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <FaQuestionCircle
        className="ml-2 inline-block cursor-pointer text-white hover:text-[#CC65FF]"
        onClick={() => setIsOpen(true)}
        title="Hvordan spille"
        style={{ verticalAlign: "middle" }}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsOpen(false);
        }}
      >
        <div className="relative max-h-[90vh] w-[1024px] overflow-y-auto rounded-lg bg-[#807f83] p-8 text-base text-white">
          <h2 className="mb-4 text-2xl font-bold">
            Saks, Papir, Stein - Spillregler
          </h2>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <section className="mb-6">
                <h3 className="mb-2 font-semibold">Grunnregler:</h3>
                <ul className="list-inside list-disc space-y-1">
                  <li>Saks ✂️ slår Papir 📄</li>
                  <li>Papir 📄 slår Stein 🪨</li>
                  <li>Stein 🪨 slår Saks ✂️</li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="mb-2 font-semibold">Hvordan spille:</h3>
                <ul className="list-inside list-disc space-y-1">
                  <li>Opprett spill eller bli med i et eksisterende spill</li>
                  <li>Maks 3 opprettede spill samtidig</li>
                  <li>Velg ditt trekk når det er din tur</li>
                  <li>
                    Se animasjon av motstanderens valg når begge har valgt
                  </li>
                </ul>
              </section>
            </div>

            <div>
              <section className="mb-6">
                <h3 className="mb-2 font-semibold">Rangering og statistikk:</h3>
                <div className="space-y-1">
                  Vinnprosent er kongen, men her kan man finnes seg en
                  erkefiende og ha som mål å vinne over den også!
                </div>
              </section>

              <section>
                <h3 className="mb-2 font-semibold">Statistikk viser:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Leaderboard:</strong>
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      <li>Totale kamper</li>
                      <li>Seire/tap/uavgjort</li>
                      <li>Vinnprosent</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Personlig:</strong>
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      <li>Spillhistorikk</li>
                      <li>Streaker</li>
                      <li>Favorittvalg</li>
                      <li>Motspillerstatistikk</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="mt-6 w-full rounded-lg bg-white/10 px-4 py-2 font-medium hover:bg-white/20"
          >
            Lukk
          </button>
        </div>
      </div>
    </>
  );
};
