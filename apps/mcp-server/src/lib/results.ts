import { jsonText } from "../loop-shared/index.js";

export function textResult(text: string) {
  return {
    content: [{ type: "text" as const, text }],
  };
}

export function jsonResult(value: unknown) {
  return textResult(jsonText(value));
}
