import type { Metadata } from "next";

import { TodoBoard } from "@/components/views/todo-board";

export const metadata: Metadata = {
  title: "Todo List",
};

export default function TodosPage() {
  return <TodoBoard />;
}
