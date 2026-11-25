import Keycloak from "keycloak-js"
import {reportBookmark,reportLocation} from "../features/report/call-report/location"
import { createRmsClient, type operations } from "@rms/api-contracts"

export type Account = operations["getCurrentAccount"]["responses"][200]["content"]["application/json"]
const api = createRmsClient(location.origin)
async function connect(slug: string) {
  const params = { path: { slug } }
  const { data } = await api.GET("/api/tenants/{slug}/auth/config", { params })
  if (!data) throw Error("Chưa thể mở đăng nhập cho đơn vị này.")
  const issuer = new URL(data.issuer)
  const split = issuer.pathname.lastIndexOf("/realms/")
  if (split < 0) throw Error("Cấu hình đăng nhập của đơn vị chưa hợp lệ.")
  const kc = new Keycloak({
    url: issuer.origin + issuer.pathname.slice(0, split),
    realm: decodeURIComponent(issuer.pathname.slice(split + "/realms/".length)), clientId: data.clientId,
  })
  const redirectUri = location.origin + "/app/" + slug
  // Keycloak callbacks have exact registered paths. Preserve just the local resource ID across login.
  const deepLinkKey="rms:login-source:"+slug
  const uuid=/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i
  function localQuery(raw:string){
    const source=new URLSearchParams(raw),safe=new URLSearchParams()
    const inbox=source.get("inbox")
    if(inbox==="all"||inbox==="unread"){
      safe.set("inbox",inbox)
      const notice=source.get("notice")
      if(notice&&uuid.test(notice))safe.set("notice",notice)
    }else if(source.get("report")==="home"){
      const saved=reportBookmark(source)
      if(saved)return reportLocation(saved.id,saved.singleUnit,saved.group).toString()
      safe.set("report","home")
    }else{
      for(const key of ["project","work","profile"]){
        const value=source.get(key)
        if(value&&uuid.test(value)){safe.set(key,value);break}
      }
    }
    return safe.toString()
  }
  const incoming=localQuery(location.search)
  if(incoming)sessionStorage.setItem(deepLinkKey,incoming)
  await kc.init({ onLoad:"login-required", pkceMethod:"S256", checkLoginIframe:false, redirectUri, scope:"email" })
  const requested=localQuery(sessionStorage.getItem(deepLinkKey)??"")
  sessionStorage.removeItem(deepLinkKey)
  if(requested)history.replaceState(null,"",location.pathname+"?"+requested)
  const authenticated = createRmsClient(location.origin)
  authenticated.use({ async onRequest({request}) {
    await kc.updateToken(30)
    request.headers.set("Authorization","Bearer "+kc.token)
    return request
  } })
  const configBase = new URL(import.meta.env.VITE_RMS_CONFIG_ORIGIN || location.origin)
  if (configBase.protocol!=="https:" && !(configBase.protocol==="http:" && ["localhost","127.0.0.1","[::1]"].includes(configBase.hostname))) throw Error("Địa chỉ dịch vụ cấu hình chưa hợp lệ.")
  const config = createRmsClient(configBase.origin)
  config.use({async onRequest({request}) {
    await kc.updateToken(30)
    request.headers.set("Authorization","Bearer "+kc.token)
    return request
  }})
  async function current() {
    const { data: account, response } = await authenticated.GET("/api/tenants/{slug}/auth/me", {
      params, cache: "no-store",
    })
    if (!account) throw Error(response.status === 403 ? "Tài khoản đã ngừng truy cập." : "Không thể tải thông tin tài khoản.")
    return account
  }
  return { current, config, api:authenticated, params, logout: () => { pending=undefined; return kc.logout({ redirectUri }) } }
}
let pending: { slug: string; session: ReturnType<typeof connect> } | undefined
export function session(slug: string) {
  if (pending?.slug !== slug) pending = { slug, session: connect(slug) }
  return pending.session
}

export type SignedInSession = Awaited<ReturnType<typeof connect>>
