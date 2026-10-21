import Hero from "../components/Hero";
import LiveStats from "../components/LiveStats";
import Ticker from "../components/Ticker";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";

export default function Home() {
  return (
    <>
      <Hero />
      <LiveStats />
      <Ticker />
      <Features />
      <HowItWorks />
    </>
  );
}
