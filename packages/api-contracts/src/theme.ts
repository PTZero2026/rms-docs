import type { components } from "./schema.d.ts"

export type ThemeTokens = components["schemas"]["ThemeTokens"]
export type Palette = ThemeTokens["light"]

export const defaultTheme: ThemeTokens = {
  schemaVersion: 1, font: "geist", radius: "md",
  light: { background:"#ffffff", foreground:"#203633", primary:"#126054", primaryForeground:"#ffffff", muted:"#eef3f0", mutedForeground:"#425a51", ring:"#176d5c" },
  dark: { background:"#122521", foreground:"#eaf3ef", primary:"#9de1ca", primaryForeground:"#12382d", muted:"#243b34", mutedForeground:"#c1d7cd", ring:"#82d8b9" },
}
export const alternateTheme: ThemeTokens = {
  schemaVersion: 1, font: "serif", radius: "sm",
  light: { background:"#fffaf6", foreground:"#3a2432", primary:"#713450", primaryForeground:"#ffffff", muted:"#f2e6ed", mutedForeground:"#654552", ring:"#78345b" },
  dark: { background:"#2b1b28", foreground:"#f4e5ef", primary:"#ebaed4", primaryForeground:"#382033", muted:"#432e40", mutedForeground:"#e1c5d8", ring:"#e6a3cb" },
}
const colorPattern = /^#[0-9a-f]{6}$/i
function record(x: unknown): x is Record<string,unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x)
}
function luminance(color: string) {
  const linear = [1,3,5].map(i => {
    const value = parseInt(color.slice(i,i+2),16)/255
    return value <= 0.04045 ? value/12.92 : ((value+0.055)/1.055)**2.4
  })
  return linear[0]*0.2126 + linear[1]*0.7152 + linear[2]*0.0722
}
function contrast(left: string, right: string) {
  const [a,b] = [luminance(left),luminance(right)].sort((x,y)=>y-x)
  return (a+0.05)/(b+0.05)
}
export function themeIssues(input: unknown): string[] {
  if (!record(input)) return ["theme"]
  const issues = Object.keys(input).filter(key=>!Object.hasOwn(defaultTheme,key))
  if (input.schemaVersion!==1) issues.push("schemaVersion")
  if (typeof input.font!=="string" || !["geist","system","serif"].includes(input.font)) issues.push("font")
  if (typeof input.radius!=="string" || !["sm","md","lg"].includes(input.radius)) issues.push("radius")
  for (const mode of ["light","dark"] as const) {
    const palette = input[mode]
    if (!record(palette)) { issues.push(mode); continue }
    for (const key of new Set([...Object.keys(palette),...Object.keys(defaultTheme[mode])])) {
      const value = palette[key]
      if (!Object.hasOwn(defaultTheme[mode],key) || typeof value!=="string" || !colorPattern.test(value)) issues.push(mode+"."+key)
    }
    const pairs = [["foreground","background",4.5], ["primaryForeground","primary",4.5], ["mutedForeground","muted",4.5], ["ring","background",3]] as const
    for (const [fg,bg,minimum] of pairs) {
      const front = palette[fg], back = palette[bg]
      if (typeof front === "string" && typeof back === "string" && colorPattern.test(front) && colorPattern.test(back) && contrast(front,back)<minimum) issues.push(mode+"."+fg)
    }
  }
  return issues
}
