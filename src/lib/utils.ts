import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getIdsFromPath(path: string) {
	return path.split(".").map((part) => Number.parseInt(part));
}
