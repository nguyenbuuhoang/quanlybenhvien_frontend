"use client"

import React, { useState, useEffect } from "react"
import apiClient from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"
import { TableSkeleton } from "@/components/admin/loading-skeleton"
import { API_URL } from "@/lib/axios"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const genderOptions = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
]

const statusOptions = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Tạm dừng" },
]

export default function EmployeesPage() {
  // Validate dd/mm/yyyy
  const validateBirthDate = (dateStr: string) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(dateStr)) return false;
    const [day, month, year] = dateStr.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };
  const [searchTerm, setSearchTerm] = useState("")
  const [employees, setEmployees] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [positions, setPositions] = useState<{id: string, name: string}[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  interface EmployeeForm {
    name: string;
    gender: string;
    birthDate: string; // yyyy-mm-dd
    email: string;
    departmentId: number;
    position: string;
    address: string;
  }

  const [form, setForm] = useState<EmployeeForm>({
    name: "",
    gender: "male",
    birthDate: "",
    email: "",
    departmentId: 1,
    position: "",
    address: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Fetch employees khi mount hoặc khi thêm employee thành công
  const handleReadEmployees = async () => {
    setIsLoading(true)
    try {
      const res = await apiClient.get(`${API_URL}/api/employees`)
      setEmployees(res.data.data || [])
    } catch (error) {
      setEmployees([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch departments from API
  const handleReadDepartments = async () => {
    try {
      const res = await apiClient.get(`${API_URL}/api/departments`)
      setDepartments(res.data.data || [])
    } catch (error) {
      setDepartments([])
    }
  }

  // Fetch positions from API
  const handleReadPositions = async () => {
    try {
      const res = await apiClient.get(`${API_URL}/api/employees/positions`)
      
      // Transform API data to match UI format
      let arr = [];
      if (Array.isArray(res.data)) {
        arr = res.data;
      } else if (Array.isArray(res.data.data)) {
        arr = res.data.data;
      }
      
      const transformedPositions = arr.map((position: string | {id: string, name: string}) => {
        if (typeof position === 'string') {
          return {
            id: position,
            name: position
          };
        }
        return position;
      });
      setPositions(transformedPositions);
    } catch (error) {
      setPositions([]);
    }
  }

  useEffect(() => {
    handleReadEmployees()
    handleReadDepartments()
    handleReadPositions()
  }, [])

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    if (!form.birthDate) {
      setError("Vui lòng chọn ngày sinh.");
      setSubmitting(false);
      return;
    }
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Email không hợp lệ.");
      setSubmitting(false);
      return;
    }
    try {
      await apiClient.post(`${API_URL}/api/employees`, form);
      setOpenDialog(false);
      setForm({ name: "", gender: "male", birthDate: "", email: "", departmentId: 1, position: "", address: "" });
      handleReadEmployees();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setSubmitting(false);
    }
  }  // Update employee dialog state
  const [updateDialog, setUpdateDialog] = useState(false)
  interface UpdateEmployeeForm extends EmployeeForm {
    id: number | null;
    status: string;
  }

  const [updateForm, setUpdateForm] = useState<UpdateEmployeeForm>({
    id: null,
    name: "",
    gender: "male",
    birthDate: "",
    email: "",
    departmentId: 1,
    position: "",
    address: "",
    status: "active",
  })
  const [updateSubmitting, setUpdateSubmitting] = useState(false)
  const [updateError, setUpdateError] = useState("")
  // Mở dialog cập nhật, truyền dữ liệu nhân viên vào state
  const handleOpenUpdate = (emp: any) => {
    let birthDate = emp.birthDate || "";
    setUpdateForm({
      id: emp.id,
      name: emp.name || "",
      gender: emp.gender || "male",
      birthDate,
      email: emp.email || "",
      departmentId: emp.departmentId || emp.department?.id || 1,
      position: emp.position || "",
      address: emp.address || "",
      status: emp.status || "active",
    });
    setUpdateDialog(true);
  }  

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSubmitting(true);
    setUpdateError("");
    if (!updateForm.birthDate) {
      setUpdateError("Vui lòng chọn ngày sinh.");
      setUpdateSubmitting(false);
      return;
    }
    if (!updateForm.email || !/^\S+@\S+\.\S+$/.test(updateForm.email)) {
      setUpdateError("Email không hợp lệ.");
      setUpdateSubmitting(false);
      return;
    }
    try {
      const { id, ...payload } = updateForm;
      await apiClient.put(`${API_URL}/api/employees/${updateForm.id}`, payload);
      setUpdateDialog(false);
      handleReadEmployees();
    } catch (err: any) {
      setUpdateError(err?.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setUpdateSubmitting(false);
    }
  }

  // Delete employee dialog state
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<number | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const handleOpenDelete = (empId: number) => {
    setDeleteEmployeeId(empId)
    setDeleteError("")
    setDeleteDialog(true)
  }

  const handleDeleteEmployee = async () => {
    if (!deleteEmployeeId) return
    setDeleteSubmitting(true)
    setDeleteError("")
    try {
      await apiClient.delete(`${API_URL}/api/employees/${deleteEmployeeId}`)
      setDeleteDialog(false)
      setDeleteEmployeeId(null)
      handleReadEmployees()
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || "Có lỗi xảy ra!")
    } finally {
      setDeleteSubmitting(false)
    }
  }

  const filteredEmployees = employees.filter(
    (emp) =>
      (emp.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.department?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.address || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.position || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.status || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getGenderDisplay = (gender: string) => gender === "male" ? "Nam" : gender === "female" ? "Nữ" : gender;
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Hoạt động</Badge>;
      case "inactive":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Tạm dừng</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  const getBirthYearDisplay = (birthDate: string) => birthDate ? new Date(birthDate).getFullYear() : "";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Quản lý nhân viên" description="Quản lý danh sách nhân viên bệnh viện" />
        <TableSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý nhân viên"
        description="Quản lý danh sách nhân viên bệnh viện"
        action={
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95">
                <Plus className="h-4 w-4 mr-2" />
                Thêm nhân viên
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Thêm nhân viên mới</DialogTitle>
                <DialogDescription>Nhập thông tin nhân viên để thêm mới vào hệ thống.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên</label>
                  <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nguyễn Văn A" />
                </div>
                <div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Giới tính</label>
                        <Select value={form.gender} onValueChange={val => setForm(f => ({ ...f, gender: val }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Nam</SelectItem>
                            <SelectItem value="female">Nữ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                        <DatePicker
                          selected={form.birthDate ? new Date(form.birthDate) : null}
                          onChange={date => setForm(f => ({ ...f, birthDate: date ? date.toISOString().slice(0, 10) : "" }))}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Chọn ngày sinh"
                          className="w-full border rounded px-3 py-2 text-sm placeholder:text-gray-400"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          maxDate={new Date()}
                          required
                        />
                      </div>
                    </div>
                  </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="nguyenvana@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Khoa/Phòng</label>
                  <Select value={form.departmentId.toString()} onValueChange={val => setForm(f => ({ ...f, departmentId: parseInt(val) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khoa/phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Chức danh</label>
                  <Select value={form.position} onValueChange={val => setForm(f => ({ ...f, position: val }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chức danh" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map(pos => (
                        <SelectItem key={pos.id} value={pos.name}>{pos.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                  <Input required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Địa chỉ" />
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <DialogFooter>
                  <Button type="submit" disabled={submitting} className="bg-blue-600 w-full mt-2">
                    {submitting ? "Đang thêm..." : "Thêm nhân viên"}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="w-full">Hủy</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-100">
        <CardHeader>
          <CardTitle className="text-lg">Tìm kiếm và lọc</CardTitle>
          <CardDescription>Tìm kiếm nhân viên theo tên, email, khoa/phòng, chức danh</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors" />
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:scale-[1.02]"
            />
          </div>
        </CardContent>
      </Card>

  <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách nhân viên</CardTitle>
              <CardDescription>
                Hiển thị {filteredEmployees.length} trong tổng số {employees.length} nhân viên
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>STT</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>Năm sinh</TableHead>
                  <TableHead>Chức danh</TableHead>
                  <TableHead>Khoa/Phòng</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[70px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp, index) => (
                    <TableRow
                      key={emp.id}
                      className="hover:bg-gray-50 transition-all duration-200"
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell>{getGenderDisplay(emp.gender)}</TableCell>
                      <TableCell>{getBirthYearDisplay(emp.birthDate)}</TableCell>
                      <TableCell>{emp.position}</TableCell>
                      <TableCell>{emp.department?.name}</TableCell>
                      <TableCell>{emp.address}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{getStatusBadge(emp.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-gray-100 transition-all hover:scale-110"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 animate-in fade-in-0 slide-in-from-top-2">
                            <DropdownMenuItem
                              className="cursor-pointer hover:bg-blue-50 transition-colors"
                              onSelect={e => { e.preventDefault(); handleOpenUpdate(emp); }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Cập nhật
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50 transition-colors"
                              onSelect={e => { e.preventDefault(); handleOpenDelete(emp.id); }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-2 text-gray-500 animate-in fade-in-0 zoom-in-50 duration-500">
                        <Search className="h-8 w-8" />
                        <p>Không tìm thấy nhân viên nào phù hợp với từ khóa "{searchTerm}"</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Dialog cập nhật nhân viên */}
          <Dialog open={updateDialog} onOpenChange={setUpdateDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Cập nhật nhân viên</DialogTitle>
                <DialogDescription>Cập nhật thông tin nhân viên.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateEmployee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên</label>
                  <Input required value={updateForm.name} onChange={e => setUpdateForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Giới tính</label>
                      <Select value={updateForm.gender} onValueChange={val => setUpdateForm(f => ({ ...f, gender: val }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Nam</SelectItem>
                          <SelectItem value="female">Nữ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                      <DatePicker
                        selected={updateForm.birthDate ? new Date(updateForm.birthDate) : null}
                        onChange={date => setUpdateForm(f => ({ ...f, birthDate: date ? date.toISOString().slice(0, 10) : "" }))}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Chọn ngày sinh"
                        className="w-full border rounded px-3 py-2 text-sm placeholder:text-gray-400"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        maxDate={new Date()}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Chức danh</label>
                  <Select value={updateForm.position} onValueChange={val => setUpdateForm(f => ({ ...f, position: val }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chức danh" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map(pos => (
                        <SelectItem key={pos.id} value={pos.name}>{pos.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Khoa/Phòng</label>
                  <Select value={updateForm.departmentId.toString()} onValueChange={val => setUpdateForm(f => ({ ...f, departmentId: parseInt(val) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khoa/phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                  <Input required value={updateForm.address} onChange={e => setUpdateForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input required type="email" value={updateForm.email} onChange={e => setUpdateForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Trạng thái</label>
                  <Select value={updateForm.status} onValueChange={val => setUpdateForm(f => ({ ...f, status: val }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {updateError && <div className="text-red-600 text-sm">{updateError}</div>}
                <DialogFooter>
                  <Button type="submit" disabled={updateSubmitting} className="bg-blue-600 w-full mt-2">
                    {updateSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="w-full">Hủy</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {/* Dialog xóa nhân viên */}
          <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Xác nhận xóa nhân viên</DialogTitle>
                <DialogDescription>Bạn có chắc chắn muốn xóa nhân viên này? Thao tác này không thể hoàn tác.</DialogDescription>
              </DialogHeader>
              {deleteError && <div className="text-red-600 text-sm mb-2">{deleteError}</div>}
              <DialogFooter>
                <Button onClick={handleDeleteEmployee} disabled={deleteSubmitting} className="bg-red-600 w-full">
                  {deleteSubmitting ? "Đang xóa..." : "Xác nhận xóa"}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="w-full">Hủy</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
