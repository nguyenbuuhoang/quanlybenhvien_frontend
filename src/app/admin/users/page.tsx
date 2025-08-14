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
import { Search, Plus, MoreHorizontal, Edit, Trash2, UserCheck, UserX } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"
import { TableSkeleton } from "@/components/admin/loading-skeleton"
import { API_URL } from "@/lib/axios"

// Roles fetched from API


const statusOptions = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Tạm dừng" },
  { value: "banned", label: "Khóa" },
]

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    username: "",
    password: "",
    roleId: 1,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")


  // Fetch users khi mount hoặc khi thêm user thành công
  const handleReadUsers = async () => {
    setIsLoading(true)
    try {
      const res = await apiClient.get(`${API_URL}/api/users`)
      setUsers(res.data.data || [])
    } catch (error) {
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch roles from API
  const handleReadRoles = async () => {
    try {
      const res = await apiClient.get(`${API_URL}/api/roles`)
      setRoles(res.data)
    } catch (error) {
      setRoles([])
    }
  }

  useEffect(() => {
    handleReadUsers()
    handleReadRoles()
  }, [])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    try {
      await apiClient.post(`${API_URL}/api/users`, form)
      setOpenDialog(false)
      setForm({ fullname: "", email: "", username: "", password: "", roleId: 1 })
      handleReadUsers()
    } catch (err: any) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra!")
    } finally {
      setSubmitting(false)
    }
  }
    // Update user dialog state
    const [updateDialog, setUpdateDialog] = useState(false)
    const [updateForm, setUpdateForm] = useState({
      id: null,
      fullname: "",
      email: "",
      roleId: 1,
      status: "active",
    })
    const [updateSubmitting, setUpdateSubmitting] = useState(false)
    const [updateError, setUpdateError] = useState("")
    const handleOpenUpdate = (user: any) => {
      setUpdateForm({
        id: user.id,
        fullname: user.fullname || "",
        email: user.email || "",
        roleId: user.roleId || user.role?.id || 1,
        status: user.status || "active",
      })
      setUpdateError("")
      setTimeout(() => setUpdateDialog(true), 100)
    }

    const handleUpdateUser = async (e: React.FormEvent) => {
      e.preventDefault()
      setUpdateSubmitting(true)
      setUpdateError("")
      try {
        await apiClient.put(`${API_URL}/api/users/${updateForm.id}`, {
          fullname: updateForm.fullname,
          email: updateForm.email,
          roleId: updateForm.roleId,
          status: updateForm.status,
        })
        setUpdateDialog(false)
        handleReadUsers()
      } catch (err: any) {
        setUpdateError(err?.response?.data?.message || "Có lỗi xảy ra!")
      } finally {
        setUpdateSubmitting(false)
      }
    }

  // Delete user dialog state
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<number|null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const handleOpenDelete = (userId: number) => {
    setDeleteUserId(userId)
    setDeleteError("")
    setDeleteDialog(true)
  }

  const handleDeleteUser = async () => {
    if (!deleteUserId) return
    setDeleteSubmitting(true)
    setDeleteError("")
    try {
      await apiClient.delete(`${API_URL}/api/users/${deleteUserId}`)
      setDeleteDialog(false)
      setDeleteUserId(null)
      handleReadUsers()
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || "Có lỗi xảy ra!")
    } finally {
      setDeleteSubmitting(false)
    }
  }
  
  const filteredUsers = users.filter(
    (user) =>
    ((user.name || user.fullname || user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.role?.name || user.role || "").toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Hoạt động</Badge>
      case "inactive":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Không hoạt động</Badge>
      case "banned":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Khóa tài khoản</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Admin</Badge>
      case "Manager":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Manager</Badge>
      case "User":
        return <Badge variant="outline">User</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Quản lý người dùng" description="Quản lý danh sách người dùng trong hệ thống" />
        <TableSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý người dùng"
        description="Quản lý danh sách người dùng trong hệ thống"
        action={
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95">
                <Plus className="h-4 w-4 mr-2" />
                Thêm người dùng
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Thêm người dùng mới</DialogTitle>
                <DialogDescription>Nhập thông tin người dùng để thêm mới vào hệ thống.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Họ tên</label>
                  <Input required value={form.fullname} onChange={e => setForm(f => ({ ...f, fullname: e.target.value }))} placeholder="Nguyen Van A" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="vana@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
                  <Input required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="vana" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mật khẩu</label>
                  <Input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Password123" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vai trò</label>
                  <Select value={form.roleId.toString()} onValueChange={val => setForm(f => ({ ...f, roleId: Number(val) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <DialogFooter>
                  <Button type="submit" disabled={submitting} className="bg-blue-600 w-full mt-2">
                    {submitting ? "Đang thêm..." : "Thêm người dùng"}
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
          <CardDescription>Tìm kiếm người dùng theo tên, email hoặc vai trò</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors" />
            <Input
              placeholder="Tìm kiếm người dùng..."
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
              <CardTitle>Danh sách người dùng</CardTitle>
              <CardDescription>
                Hiển thị {filteredUsers.length} trong tổng số {users.length} người dùng
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-[70px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-gray-50 transition-all duration-200 animate-in fade-in-0 slide-in-from-left-4"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-medium">{user.fullname || user.username || ""}</TableCell>
                      <TableCell className="text-gray-600">{user.email || ""}</TableCell>
                      <TableCell>{getRoleBadge(user.role?.name || "")}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-gray-600">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}</TableCell>
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
                              onSelect={e => { e.preventDefault(); handleOpenUpdate(user); }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Cập nhật
                            </DropdownMenuItem>
                            {/* Update User Dialog */}
                            <Dialog open={updateDialog} onOpenChange={setUpdateDialog}>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Cập nhật người dùng</DialogTitle>
                                  <DialogDescription>Cập nhật thông tin người dùng.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleUpdateUser} className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Họ tên</label>
                                    <Input required value={updateForm.fullname} onChange={e => setUpdateForm(f => ({ ...f, fullname: e.target.value }))} />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <Input required type="email" value={updateForm.email} onChange={e => setUpdateForm(f => ({ ...f, email: e.target.value }))} />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Vai trò</label>
                                    <Select value={updateForm.roleId?.toString()} onValueChange={val => setUpdateForm(f => ({ ...f, roleId: Number(val) }))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Chọn vai trò" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {roles.map(role => (
                                          <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
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
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50 transition-colors"
                              onSelect={e => { e.preventDefault(); handleOpenDelete(user.id); }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                            {/* Delete User Dialog */}
                            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                              <DialogContent className="max-w-sm">
                                <DialogHeader>
                                  <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
                                  <DialogDescription>Bạn có chắc chắn muốn xóa người dùng này? Thao tác này không thể hoàn tác.</DialogDescription>
                                </DialogHeader>
                                {deleteError && <div className="text-red-600 text-sm mb-2">{deleteError}</div>}
                                <DialogFooter>
                                  <Button onClick={handleDeleteUser} disabled={deleteSubmitting} className="bg-red-600 w-full">
                                    {deleteSubmitting ? "Đang xóa..." : "Xác nhận xóa"}
                                  </Button>
                                  <DialogClose asChild>
                                    <Button type="button" variant="outline" className="w-full">Hủy</Button>
                                  </DialogClose>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-2 text-gray-500 animate-in fade-in-0 zoom-in-50 duration-500">
                        <Search className="h-8 w-8" />
                        <p>Không tìm thấy người dùng nào phù hợp với từ khóa "{searchTerm}"</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
