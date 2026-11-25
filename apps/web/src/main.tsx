import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@rms/ui/globals.css"
import { App } from "./App"

import { openReviewCase } from "./demo/review-entry"

openReviewCase()
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
