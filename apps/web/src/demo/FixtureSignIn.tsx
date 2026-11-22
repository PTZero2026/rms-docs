import { useState } from "react"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import { fixtureSignIn } from "./repository"
import type { Session, Tenant } from "./types"

export default function FixtureSignIn({
  tenant,
  done,
}: {
  tenant: Tenant
  done: (s: Session) => void
}) {
  const [email, setEmail] = useState("khach@example.invalid")
  const [challenge, setChallenge] = useState(false)
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  return (
    <form
      className="stack"
      onSubmit={(event) => {
        event.preventDefault()
        try {
          if (!/^[a-z\d._+-]+@example\.invalid$/i.test(email.trim()))
            throw Error("Dùng địa chỉ mẫu thuộc @example.invalid.")
          if (!challenge) {
            setChallenge(true)
            setError("")
            return
          }
          if (otp !== "210926")
            throw Error("Mã chưa khớp. Nhập sáu chữ số hiển thị trong phiên mô phỏng.")
          done(fixtureSignIn(tenant, email))
        } catch (e) {
          setError((e as Error).message)
        }
      }}
    >
      <label className="form-label">
        Email mẫu
        <Input
          type="email"
          value={email}
          required
          onChange={(e) => {
            setEmail(e.target.value)
            setChallenge(false)
            setOtp("")
          }}
        />
      </label>
      {challenge && (
        <>
          <p>
            Mã mô phỏng <strong>210926</strong>. Mã hiển thị ngay tại đây cho cả hai đơn vị.
          </p>
          <label className="form-label">
            Mã xác nhận
            <Input
              value={otp}
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              onChange={(e) => setOtp(e.target.value)}
            />
          </label>
        </>
      )}
      {error && <p role="alert">{error}</p>}
      <Button type="submit">{challenge ? "Đăng nhập" : "Nhận mã mô phỏng"}</Button>
    </form>
  )
}
