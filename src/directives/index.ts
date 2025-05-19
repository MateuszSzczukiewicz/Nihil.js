import type { DirectiveHandler } from "@/types/directive.types";
import { nTextDirective } from "@/directives/n-text.directive";

export const directives: Record<string, DirectiveHandler> = {
    text: nTextDirective,
};
