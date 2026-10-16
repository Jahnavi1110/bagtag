import type { ComponentType } from "react";
import type { TemplateId } from "@/lib/types";
import { Keychain } from "./Keychain";
import { LaptopSticker } from "./LaptopSticker";
import { LuggageTag } from "./LuggageTag";
import { RoundSticker } from "./RoundSticker";
import { SchoolLabel } from "./SchoolLabel";
import type { TemplateProps } from "./types";

export const TEMPLATE_COMPONENTS: Record<TemplateId, ComponentType<TemplateProps>> = {
  luggage: LuggageTag,
  round: RoundSticker,
  keychain: Keychain,
  school: SchoolLabel,
  laptop: LaptopSticker,
};
