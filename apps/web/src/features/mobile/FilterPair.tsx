import { Button } from "@rms/ui/components/button"

type Props = {
  label: string
  options: readonly [string, string]
  secondActive: boolean
  onChange: (second: boolean) => void
}

export function FilterPair({ label, options, secondActive, onChange }: Props) {
  return (
    <div role="group" aria-label={label} className="mobile-filters">
      {options.map((text, index) => (
        <Button
          key={text}
          variant="ghost"
          aria-pressed={secondActive === (index === 1)}
          onClick={() => onChange(index === 1)}
        >
          {text}
        </Button>
      ))}
    </div>
  )
}
