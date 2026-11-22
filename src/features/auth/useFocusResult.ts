"use client";

import { type RefObject, useEffect } from "react";
import type { AuthFormState } from "./form-state";

/**
 * Tras enviar, lleva el foco a donde está la respuesta: al primer campo con
 * error o, si no hay, al mensaje general. Así lectores de pantalla y teclado
 * no se quedan en el botón sin saber qué pasó (WCAG 3.3.1, 4.1.3).
 */
export function useFocusResult(formRef: RefObject<HTMLFormElement | null>, state: AuthFormState) {
  useEffect(() => {
    if (state.status === "idle") return;
    const form = formRef.current;
    if (!form) return;
    const invalid = form.querySelector<HTMLElement>('[aria-invalid="true"]');
    const message = form.querySelector<HTMLElement>("[data-form-message]");
    (invalid ?? message)?.focus();
  }, [formRef, state]);
}
