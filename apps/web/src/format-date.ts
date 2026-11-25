const day = {
  timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric",
} satisfies Intl.DateTimeFormatOptions

const minute = {
  ...day, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
} satisfies Intl.DateTimeFormatOptions

const formats = {
  day: new Intl.DateTimeFormat("vi-VN", day),
  minute: new Intl.DateTimeFormat("vi-VN", minute),
  second: new Intl.DateTimeFormat("vi-VN", { ...minute, second: "2-digit" }),
}

export function formatVietnamDate(iso: string, precision: keyof typeof formats = "day") {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? "—" : formats[precision].format(date)
}
