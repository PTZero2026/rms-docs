import {test} from "node:test"
import assert from "node:assert/strict"
import {themeIssues, defaultTheme, alternateTheme} from "@rms/api-contracts/theme"

test("both schemes meet text and focus thresholds; invalid tokens report their field", () => {
  for (const theme of [defaultTheme, alternateTheme]) assert.deepEqual(themeIssues(theme), [])
  const theme = structuredClone(defaultTheme)
  theme.dark.mutedForeground=theme.dark.muted
  theme.light.ring=theme.light.background
  assert.deepEqual(new Set(themeIssues(theme)),new Set(["dark.mutedForeground","light.ring"]))
  assert.ok(themeIssues({...theme,font:"url(external)"}).includes("font"))
  assert.ok(themeIssues({...theme,css:"body{}"}).includes("css"))
  assert.ok(themeIssues({...theme,light:{...theme.light,primary:"#zzzzzz"}}).includes("light.primary"))
})
