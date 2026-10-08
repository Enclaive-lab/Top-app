"use client";

import { ErrorPage } from "./ErrorPage";

export default function ServerError({ retry }: { retry: () => void }) {
  return <ErrorPage status="500" retry={retry} />;
}
