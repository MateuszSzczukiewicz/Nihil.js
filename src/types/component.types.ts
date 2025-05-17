import { z } from "zod";
import { NihilDataObjectSchema } from "@/schemas/component.schemas";

export type NihilComponentData = z.infer<typeof NihilDataObjectSchema>;

export interface NihilComponent {
    element: HTMLElement;
    data: NihilComponentData;
}
