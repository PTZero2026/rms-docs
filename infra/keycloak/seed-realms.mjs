import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

export function localRealm(slug, { origin = "http://127.0.0.1:5173", smtpHost = "mailpit", smtpPort = 1025, loginSeconds = 300 } = {}) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw Error("Invalid realm slug")
  const callback = new URL("/app/" + slug, origin).href
  const execution = (authenticator, priority, extra = {}) => ({
    authenticator, priority, authenticatorFlow: false, requirement: "REQUIRED", userSetupAllowed: false, ...extra,
  })
  return {
    realm: slug, enabled: true, sslRequired: "external", registrationAllowed: false,
    loginWithEmailAllowed: true, duplicateEmailsAllowed: false,
    resetPasswordAllowed: false, rememberMe: false, loginTheme: "keycloak",
    accessTokenLifespan: 300, accessCodeLifespan: 60,
    accessCodeLifespanLogin: loginSeconds, accessCodeLifespanUserAction: loginSeconds,
    bruteForceProtected: true, permanentLockout: false, failureFactor: 5,
    waitIncrementSeconds: 60, maxFailureWaitSeconds: 900, minimumQuickLoginWaitSeconds: 10,
    maxDeltaTimeSeconds: 900,
    smtpServer: { host: smtpHost, port: String(smtpPort), from: "rms@school.example.invalid", auth: "false", ssl: "false", starttls: "false" },
    clients: [{
      clientId: "rms-web", enabled: true, protocol: "openid-connect", publicClient: true,
      standardFlowEnabled: true, implicitFlowEnabled: false, directAccessGrantsEnabled: false,
      redirectUris: [callback], webOrigins: [new URL(origin).origin],
      attributes: { "pkce.code.challenge.method": "S256", "post.logout.redirect.uris": callback },
      protocolMappers: ["rms-api","rms-config"].map(audience => ({
        name: audience+"-audience", protocol: "openid-connect", protocolMapper: "oidc-audience-mapper",
        config: { "included.custom.audience": audience, "access.token.claim": "true", "id.token.claim": "false" },
      })),
    }],
    requiredActions: [{ alias: "VERIFY_PROFILE", name: "Verify Profile", providerId: "VERIFY_PROFILE", enabled: false, defaultAction: false, priority: 90 }],
    browserFlow: "RMS email OTP",
    authenticationFlows: [
      { alias: "RMS email OTP", providerId: "basic-flow", topLevel: true, builtIn: false,
        authenticationExecutions: [
          execution("auth-cookie", 10, { requirement: "ALTERNATIVE" }),
          { authenticatorFlow: true, requirement: "ALTERNATIVE", priority: 20, flowAlias: "RMS email forms", userSetupAllowed: false },
        ] },
      { alias: "RMS email forms", providerId: "basic-flow", topLevel: false, builtIn: false,
        authenticationExecutions: [
          execution("reset-credentials-choose-user", 10),
          execution("ext-email-otp", 20, { authenticatorConfig: "RMS first login" }),
        ] },
    ],
    authenticatorConfig: [{ alias: "RMS first login", config: { "ext-magic-create-nonexistent-user": "true" } }],
  }
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = process.argv[2]
  if (!dir) throw Error("Usage: node seed-realms.mjs OUTPUT_DIRECTORY")
  await mkdir(dir, { recursive: true })
  for (const slug of ["school-1", "school-2"]) {
    const realm = localRealm(slug, {
      origin: process.env.RMS_WEB_ORIGIN, smtpHost: process.env.RMS_SMTP_HOST,
      smtpPort: Number(process.env.RMS_SMTP_PORT ?? 1025), loginSeconds: Number(process.env.RMS_LOGIN_SECONDS ?? 300),
    })
    await writeFile(join(dir, slug + "-realm.json"), JSON.stringify(realm, null, 2) + "\n")
  }
}
