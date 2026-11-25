import { ToggleGroup, ToggleGroupItem } from "@rms/ui/components/toggle-group"

type Props = {
  label: string
  options: readonly [string, string]
  secondActive: boolean
  onChange: (second: boolean) => void
}

export function FilterPair({ label, options, secondActive, onChange }: Props) {
  return (
    <ToggleGroup type="single" aria-label={label} className="mobile-filters"
      value={secondActive ? "second" : "first"} onValueChange={value => { if (value) onChange(value === "second") }}>
      <ToggleGroupItem value="first">{options[0]}</ToggleGroupItem>
      <ToggleGroupItem value="second">{options[1]}</ToggleGroupItem>
    </ToggleGroup>
  )
}
