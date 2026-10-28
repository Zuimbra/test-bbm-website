"use client";

import { useState } from "react";
import CommunityFeed from "@/components/CommunityFeed";
import YourMiles from "@/components/YourMiles";

type CommunityTab = "feed" | "miles";

type Props = {
  userId: string;
};

export default function CommunityTabs({ userId }: Props) {
  const [activeTab, setActiveTab] = useState<CommunityTab>("feed");

  return (
    <section className="mx-auto max-w-[1500px] px-6 pb-24 md:px-12">
      <div className="max-w-[900px]">
        <div className="grid grid-cols-2 border-b border-neutral-700">
          <button type="button" aria-pressed={activeTab === "feed"}
            onClick={() => setActiveTab("feed")}
            className={`border-b-2 pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
              activeTab === "feed"
                ? "border-white text-white"
                : "border-transparent text-neutral-500 hover:text-white"
            }`}
          >
            THE FEED
          </button>
          <button type="button" aria-pressed={activeTab === "miles"}
            onClick={() => setActiveTab("miles")}
            className={`border-b-2 pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
              activeTab === "miles"
                ? "border-white text-white"
                : "border-transparent text-neutral-500 hover:text-white"
            }`}
          >
            YOUR MILES
          </button>
        </div>

        <div className="mt-6 border border-neutral-700 bg-[#181818] p-6 md:p-8">
          {activeTab === "feed" ? (
            <>
              <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-neutral-500">01 / OFFICIAL</p>
              <h2 className="text-4xl font-black uppercase tracking-tighter">THE FEED.</h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-400">
                Behind the scenes, announcements, new drops and stories from BBM.
              </p>
              <CommunityFeed userId={userId} />
            </>
          ) : (
            <>
              <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-neutral-500">02 / MEMBERS</p>
              <h2 className="text-4xl font-black uppercase tracking-tighter">YOUR MILES.</h2>
              <YourMiles userId={userId} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
