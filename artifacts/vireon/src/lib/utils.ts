import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function playSound(url: string) {
  try {
    const audio = new Audio(url);
    audio.play().catch((e) => console.log("Audio play prevented:", e));
  } catch (e) {
    console.log("Audio not supported");
  }
}
