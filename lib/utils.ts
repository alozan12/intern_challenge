import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a Response object with a ReadableStream body for streaming text
 */
export class StreamResponse extends Response {
  constructor(stream: ReadableStream, init?: ResponseInit) {
    super(stream, {
      ...init,
      headers: {
        ...init?.headers,
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }
}