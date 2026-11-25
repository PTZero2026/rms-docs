import { defaultTheme, themeIssues, type ThemeTokens } from "@rms/api-contracts/theme"

export function applyTheme(root: HTMLElement, input: unknown, mode: "light" | "dark") {
  const theme = themeIssues(input).length ? defaultTheme : input as ThemeTokens
  const p = theme[mode]
  const font = {geist:'"Geist Variable", sans-serif', system:"system-ui, sans-serif", serif:"Georgia, serif"}[theme.font]
  const values: Record<string,string> = {
    "--background":p.background, "--foreground":p.foreground, "--paper":p.background, "--ink":p.foreground,
    "--popover":p.background, "--popover-foreground":p.foreground, "--card":p.background, "--card-foreground":p.foreground,
    "--primary":p.primary, "--primary-foreground":p.primaryForeground, "--muted":p.muted, "--muted-foreground":p.mutedForeground,
    "--secondary":p.muted, "--secondary-foreground":p.mutedForeground, "--accent":p.muted, "--accent-foreground":p.foreground,
    "--border":p.mutedForeground, "--input":p.mutedForeground, "--ring":p.ring,
    "--radius":{sm:"0.25rem",md:"0.625rem",lg:"1rem"}[theme.radius], "--rms-font":font,
  }
  const original = Object.keys(values).map(key=>[key,root.style.getPropertyValue(key)])
  const wasDark = root.classList.contains("dark")
  root.classList.toggle("dark", mode === "dark")
  for (const [name,value] of Object.entries(values)) root.style.setProperty(name,value)
  return () => {
    root.classList.toggle("dark",wasDark)
    for (const [key,value] of original) root.style.setProperty(key,value)
  }
}
