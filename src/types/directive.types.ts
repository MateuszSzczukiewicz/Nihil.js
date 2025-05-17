import { Nihil } from "@/core/Nihil";
import { NihilComponent } from "@/types/component.types";

export interface DirectiveContext {
    element: HTMLElement;
    attributeName: string;
    directiveName: string;
    directiveArgument?: string;
    directiveModifiers: string[];
    expression: string;
    component: NihilComponent;
    nihilInstance?: Nihil;
}

export type DirectiveHandlerResult = void | (() => void);
export type DirectiveHandler = (context: DirectiveContext) => void | (() => void);
