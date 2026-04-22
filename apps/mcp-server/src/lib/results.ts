import { jsonText } from "@carely/loop-shared";

export function textResult(text: string) {
  return {
    content: [{ type: "text" as const, text }],
  };
}

export function jsonResult(value: unknown) {
  return textResult(jsonText(value));
}
