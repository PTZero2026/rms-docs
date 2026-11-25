import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { useLayoutEffect, useState } from "react"
import { alternateTheme, defaultTheme } from "@rms/api-contracts/theme"
import { applyTheme } from "@rms/ui/theme"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@rms/ui/components/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@rms/ui/components/table"

export default function Gallery() {
  const [school,setSchool] = useState("a")
  const [mode,setMode] = useState<"light"|"dark">("light")
  const [title,setTitle] = useState("")
  useLayoutEffect(() => applyTheme(document.documentElement, school==="a" ? defaultTheme : alternateTheme, mode),[school,mode])
  return <main className="mx-auto grid max-w-3xl gap-6 p-5 sm:p-10">
    <header><h1 className="text-2xl font-semibold">Xem thử giao diện</h1></header>
    <div className="flex flex-wrap gap-4">
      <label className="grid gap-1">Đơn vị
        <ChoiceSelect value={school} onValueChange={setSchool}>
          <ChoiceOption value="a">Trường A</ChoiceOption><ChoiceOption value="b">Trường B</ChoiceOption>
        </ChoiceSelect>
      </label>
      <label className="grid gap-1">Chế độ hiển thị
        <ChoiceSelect value={mode} onValueChange={choiceValue => setMode(choiceValue==="dark"?"dark":"light")}>
          <ChoiceOption value="light">Sáng</ChoiceOption><ChoiceOption value="dark">Tối</ChoiceOption>
        </ChoiceSelect>
      </label>
    </div>
    <section className="grid gap-4 rounded-lg border bg-card p-5 text-card-foreground">
      <h2 className="text-lg font-semibold">Đề xuất đề tài</h2>
      <label className="grid gap-2">Tên đề tài<Input value={title} onChange={e=>setTitle(e.target.value)}/></label>
      <Dialog><DialogTrigger asChild><Button className="justify-self-start">Kiểm tra hồ sơ</Button></DialogTrigger>
        <DialogContent><DialogHeader>
          <DialogTitle>{title.trim()?"Đã có tên đề tài":"Thiếu tên đề tài"}</DialogTitle>
          <DialogDescription>{title.trim()?title.trim():"Nhập tên đề tài trước khi gửi hồ sơ."}</DialogDescription>
        </DialogHeader><DialogClose asChild><Button variant="outline">Quay lại hồ sơ</Button></DialogClose></DialogContent>
      </Dialog>
    </section>
    <section className="grid gap-2"><h2 className="text-lg font-semibold">Hồ sơ mẫu</h2>
      <Table><TableHeader><TableRow><TableHead>Mã đề tài</TableHead><TableHead>Trạng thái</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><TableCell>NC-2027-01</TableCell><TableCell>Bản nháp</TableCell></TableRow></TableBody>
      </Table>
    </section>
  </main>
}
