import Hero from "@/components/Hero";
import WhatYouGet from "@/components/WhatYouGet";
import AdvantageCards from "@/components/AdvantageCards";
import SpecsGrid from "@/components/SpecsGrid";
import IntegrationCards from "@/components/IntegrationCards";
import FooterCta from "@/components/FooterCta";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-paper overflow-x-hidden">
      <Hero />
      <WhatYouGet />
      <AdvantageCards />
      <SpecsGrid />
      <IntegrationCards />
      <FooterCta />
    </main>
  );
}
