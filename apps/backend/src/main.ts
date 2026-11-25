import { createApplication } from "./application.js"

const app = await createApplication()
app.enableShutdownHooks()
await app.listen(Number(process.env.PORT ?? 3100), process.env.HOST ?? "127.0.0.1")
