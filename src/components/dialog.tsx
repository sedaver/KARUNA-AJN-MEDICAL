"use client";
import { useId, useRef, type ReactNode } from "react";
import { Button } from "./ui";
// Native modal dialog provides focus trapping, Escape dismissal, and focus return.
export function Dialog({
  trigger,
  title,
  children,
}: {
  trigger: string;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  return (
    <>
      <Button onClick={() => ref.current?.showModal()}>{trigger}</Button>
      <dialog ref={ref} aria-labelledby={titleId}>
        <h2 id={titleId}>{title}</h2>
        {children}
        <form method="dialog">
          <Button>Close</Button>
        </form>
      </dialog>
    </>
  );
}
