import type { Metadata } from "next";

import { RoadmapView } from "@/components/views/roadmap-view";

export const metadata: Metadata = {
  title: "My Roadmap",
};

export default function RoadmapPage() {
  return <RoadmapView />;
}
