import type { ComponentProps, ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "./button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible"

export function Disclosure({ title, children, ...props }: Omit<ComponentProps<typeof Collapsible>, "title"> & { title: ReactNode }) {
  return <Collapsible {...props}>
    <CollapsibleTrigger asChild>
      <Button variant="ghost" className="h-auto max-w-full justify-start whitespace-normal text-start">
        <ChevronDown data-icon="inline-start" className="transition-transform group-aria-expanded/button:rotate-180" />
        {title}
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent className="pt-2">{children}</CollapsibleContent>
  </Collapsible>
}
