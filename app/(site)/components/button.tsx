"use client";
import { useEffect, useState } from "react";

export default function Button() {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    console.log("ssasa");
  }, []);

  return (
    <>
      <button onClick={() => setCounter(counter + 1)}>Кнопка</button>
    </>
  );
}
