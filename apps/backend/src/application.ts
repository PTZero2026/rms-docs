import { AuthorRequestModule } from "./modules/iam/author-request/controller.js"
import {ProfessionalModule} from "./modules/profile/professional/controller.js"
import {ProvisionAccountModule} from "./modules/iam/provision-account/controller.js"
import {AssistantModule} from "./modules/assistant/controller.js"
import {TeachingHourModule} from "./modules/teaching-hour/teaching-hours/controller.js"
import "reflect-metadata"
import { Controller, Get, Module } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import type { operations } from "@rms/api-contracts"
import type { IncomingMessage, ServerResponse } from "node:http"

import { CapabilityModule } from "./modules/catalog/capabilities.js"
import { EvidenceModule } from "./modules/extension/controller.js"
import { StudentModule } from "./modules/student-project/confirm-mentor/controller.js"
import { AppliedModule } from "./modules/applied-project/register-applied-project/controller.js"
import { ProfileModule } from "./modules/profile/export-profile/controller.js"
import { AcceptanceModule } from "./modules/acceptance/controller.js"
import { ProductModule } from "./modules/product/controller.js"
import { BudgetModule } from "./modules/budget/controller.js"
import { InboxModule } from "./modules/notification/controller.js"
import { ProgressModule } from "./modules/progress/controller.js"
import { ReportModule } from "./modules/report/call-report/controller.js"
import { HomeModule } from "./modules/home/open-work-item/controller.js"
import { ReviewModule } from "./modules/review/controller.js"
import { ProposalModule } from "./modules/proposal/controller.js"
import { CallModule } from "./modules/call/controller.js"
import { WorkflowModule } from "./modules/workflow/controller.js"
import { AccountModule } from "./modules/iam/lock-account/controller.js"
import { AuditModule } from "./modules/audit/audit-trail/controller.js"
import { AttachmentModule } from "./modules/attachments/controller.js"
import { CatalogModule } from "./modules/catalog/config-override/controller.js"
import { ThemeModule } from "./modules/catalog/theme/controller.js"
import { IamModule } from "./modules/iam/iam.module.js"

@Controller("health")
class HealthController {
  @Get()
  health(): operations["getHealth"]["responses"][200]["content"]["application/json"] {
    return { status: "ok" }
  }
}

@Module({ imports: [IamModule, CatalogModule, ThemeModule, AttachmentModule, AuditModule, AccountModule, WorkflowModule, CallModule, ProposalModule, ReviewModule, HomeModule, ReportModule, ProgressModule, InboxModule, BudgetModule, ProductModule, AcceptanceModule, ProfileModule, AppliedModule, CapabilityModule, StudentModule, EvidenceModule, TeachingHourModule, AssistantModule, ProvisionAccountModule, ProfessionalModule, AuthorRequestModule], controllers: [HealthController] })
class AppModule {}

export async function createApplication() {
  const app = await NestFactory.create(AppModule, { logger: ["warn", "error"] })
  app.getHttpAdapter().getInstance().disable("x-powered-by")
  app.use((_request: IncomingMessage, response: ServerResponse, next: () => void) => {
    response.setHeader("Cache-Control", "private, no-store")
    response.setHeader("X-Content-Type-Options", "nosniff")
    response.setHeader("Referrer-Policy", "no-referrer")
    next()
  })
  app.setGlobalPrefix("api")
  return app
}
