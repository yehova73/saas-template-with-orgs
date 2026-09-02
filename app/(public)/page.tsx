import type { Metadata } from "next";
import { MobileStickyCta } from "./_components/navbar";

export const metadata: Metadata = {
  title: "[placeholder landing title]",
  description: "[placeholder landing description]",
};

export default function Home() {
  return (
    <>
      <MobileStickyCta />
    </>
  );
}
