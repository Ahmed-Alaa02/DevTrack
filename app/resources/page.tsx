import type { Metadata } from "next";

import { ResourcesView } from "@/components/views/resources-view";

export const metadata: Metadata = {
  title: "Resources",
};

export default function ResourcesPage() {
  return <ResourcesView />;
}
