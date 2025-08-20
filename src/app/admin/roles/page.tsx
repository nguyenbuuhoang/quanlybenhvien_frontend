"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Shield, Users, Eye } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"
import { CardSkeleton } from "@/components/admin/loading-skeleton"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/axios";
// Checkbox với indeterminate
import type { ComponentPropsWithoutRef } from "react";
const CheckboxWithIndeterminate = ({ checked, indeterminate, ...props }: {
  checked: boolean;
  indeterminate: boolean;
} & ComponentPropsWithoutRef<typeof Checkbox>) => {
  return <Checkbox checked={checked} {...props} />;
};
// Type definitions matching the API structure
interface Permission {
  resource: string
  actions: string[]
}

interface Role {
  id: number
  name: string
  description: string
  permissions: Permission[]
  userCount: number
  createdAt: string
  updatedAt: string
}

// API Resource and Action types
interface ResourceData {
  id: string
  name: string
}

interface ActionData {
  id: string
  name: string
  color?: string
}

function RoleManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<ResourceData[]>([]);
  const [actions, setActions] = useState<ActionData[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: {} as Record<string, string[]>,
  });

  // States for update dialog
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [updateRole, setUpdateRole] = useState({
    name: "",
    description: "",
    permissions: {} as Record<string, string[]>,
  });

  // States for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch roles, resources và actions song song
        const [rolesRes, resourcesRes, actionsRes] = await Promise.all([
          apiClient.get("/api/roles"),
          apiClient.get("/api/roles/resources"),
          apiClient.get("/api/roles/actions")
        ]);

        // Set roles
        if (Array.isArray(rolesRes.data)) {
          setRoles(rolesRes.data);
        } else if (Array.isArray(rolesRes.data.data)) {
          setRoles(rolesRes.data.data);
        } else {
          setRoles([]);
        }

        // Set resources - Transform API data to match UI format
        if (Array.isArray(resourcesRes.data)) {
          const transformedResources = resourcesRes.data.map((resource: string | ResourceData) => {
            if (typeof resource === 'string') {
              return {
                id: resource,
                name: resource
              };
            }
            return resource;
          });
          setResources(transformedResources);
        } else if (Array.isArray(resourcesRes.data.data)) {
          const transformedResources = resourcesRes.data.data.map((resource: string | ResourceData) => {
            if (typeof resource === 'string') {
              return {
                id: resource,
                name: resource
              };
            }
            return resource;
          });
          setResources(transformedResources);
        }

        // Set actions - Transform API data to match UI format
        if (Array.isArray(actionsRes.data)) {
          const transformedActions = actionsRes.data.map((action: string | ActionData) => {
            if (typeof action === 'string') {
              return {
                id: action,
                name: action,
                color: getActionBadgeColor(action)
              };
            }
            return action;
          });
          setActions(transformedActions);
        } else if (Array.isArray(actionsRes.data.data)) {
          const transformedActions = actionsRes.data.data.map((action: string | ActionData) => {
            if (typeof action === 'string') {
              return {
                id: action,
                name: action,
                color: getActionBadgeColor(action)
              };
            }
            return action;
          });
          setActions(transformedActions);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setRoles([]);
        setResources([]);
        setActions([]);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu từ server",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  // ...existing code...

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800"
      case "read":
        return "bg-blue-100 text-blue-800"
      case "update":
        return "bg-yellow-100 text-yellow-800"
      case "delete":
        return "bg-red-100 text-red-800"
      case "manage":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case "users":
        return <Users className="h-3 w-3" />
      case "roles":
        return <Shield className="h-3 w-3" />
      default:
        return <Eye className="h-3 w-3" />
    }
  }

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên role",
        variant: "destructive",
      })
      return
    }

    // Convert permissions object to array format theo yêu cầu API
    const permissions: Permission[] = Object.entries(newRole.permissions)
      .filter(([_, actions]) => actions.length > 0)
      .map(([resource, actions]) => ({ resource, actions }))

    if (permissions.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một quyền",
        variant: "destructive",
      })
      return
    }

    // Payload theo format yêu cầu
    const payload = {
      name: newRole.name.trim(),
      description: newRole.description.trim() || `Role ${newRole.name}`,
      permissions: permissions
    }

    setIsCreating(true);
    try {
      const response = await apiClient.post("/api/roles", payload);
      
      // Refresh roles list
      const rolesRes = await apiClient.get("/api/roles");
      if (Array.isArray(rolesRes.data)) {
        setRoles(rolesRes.data);
      } else if (Array.isArray(rolesRes.data.data)) {
        setRoles(rolesRes.data.data);
      }

      setIsCreateDialogOpen(false);
      setNewRole({ name: "", description: "", permissions: {} });

      toast({
        title: "Thành công",
        description: `Role "${payload.name}" đã được tạo thành công`,
      });

    } catch (error: any) {
      console.error("Error creating role:", error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra khi tạo role",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedRole || !updateRole.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên role",
        variant: "destructive",
      })
      return
    }

    // Convert permissions object to array format theo yêu cầu API
    const permissions: Permission[] = Object.entries(updateRole.permissions)
      .filter(([_, actions]) => actions.length > 0)
      .map(([resource, actions]) => ({ resource, actions }))

    if (permissions.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một quyền",
        variant: "destructive",
      })
      return
    }

    // Payload theo format yêu cầu
    const payload = {
      name: (updateRole.name ?? "").trim(),
      description: (updateRole.description ?? "").trim(),
      permissions: permissions
    }

    setIsUpdating(true);
    try {
      const response = await apiClient.put(`/api/roles/${selectedRole.id}`, payload);
      
      // Refresh roles list
      const rolesRes = await apiClient.get("/api/roles");
      if (Array.isArray(rolesRes.data)) {
        setRoles(rolesRes.data);
      } else if (Array.isArray(rolesRes.data.data)) {
        setRoles(rolesRes.data.data);
      }

      setIsUpdateDialogOpen(false);
      setSelectedRole(null);
      setUpdateRole({ name: "", description: "", permissions: {} });

      toast({
        title: "Thành công",
        description: `Role "${payload.name}" đã được cập nhật thành công`,
      });

    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra khi cập nhật role",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  const openUpdateDialog = (role: Role) => {
    setSelectedRole(role);
    
    // Convert role permissions from API format to UI format
    const permissionsObj: Record<string, string[]> = {};
    role.permissions.forEach(permission => {
      permissionsObj[permission.resource] = permission.actions;
    });

    setUpdateRole({
      name: role.name,
      description: role.description,
      permissions: permissionsObj,
    });
    
    setIsUpdateDialogOpen(true);
  }

  const handleOpenDelete = (roleId: number) => {
    setDeleteRoleId(roleId);
    setDeleteError("");
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteRole = async () => {
    if (!deleteRoleId) return;
    
    setIsDeleting(true);
    setDeleteError("");
    
    try {
      await apiClient.delete(`/api/roles/${deleteRoleId}`);
      
      // Refresh roles list
      const rolesRes = await apiClient.get("/api/roles");
      if (Array.isArray(rolesRes.data)) {
        setRoles(rolesRes.data);
      } else if (Array.isArray(rolesRes.data.data)) {
        setRoles(rolesRes.data.data);
      }

      setIsDeleteDialogOpen(false);
      setDeleteRoleId(null);

      toast({
        title: "Thành công",
        description: "Role đã được xóa thành công",
      });

    } catch (error: any) {
      console.error("Error deleting role:", error);
      setDeleteError(error.response?.data?.message || "Có lỗi xảy ra khi xóa role");
    } finally {
      setIsDeleting(false);
    }
  }

  const handlePermissionChange = (resource: string, action: string, checked: boolean) => {
    setNewRole((prev) => {
      const newPermissions = { ...prev.permissions }
      if (!newPermissions[resource]) {
        newPermissions[resource] = []
      }

      if (checked) {
        if (!newPermissions[resource].includes(action)) {
          newPermissions[resource] = [...newPermissions[resource], action]
        }
      } else {
        newPermissions[resource] = newPermissions[resource].filter((a) => a !== action)
      }

      return { ...prev, permissions: newPermissions }
    })
  }

  const handleUpdatePermissionChange = (resource: string, action: string, checked: boolean) => {
    setUpdateRole((prev) => {
      const newPermissions = { ...prev.permissions }
      if (!newPermissions[resource]) {
        newPermissions[resource] = []
      }

      if (checked) {
        if (!newPermissions[resource].includes(action)) {
          newPermissions[resource] = [...newPermissions[resource], action]
        }
      } else {
        newPermissions[resource] = newPermissions[resource].filter((a) => a !== action)
      }

      return { ...prev, permissions: newPermissions }
    })
  }

  const handleResourceSelectAll = (resource: string, checked: boolean) => {
    setNewRole((prev) => {
      const newPermissions = { ...prev.permissions }

      if (checked) {
        // Select all actions for this resource
        newPermissions[resource] = actions.map((action) => action.id)
      } else {
        // Deselect all actions for this resource
        newPermissions[resource] = []
      }

      return { ...prev, permissions: newPermissions }
    })
  }

  const handleUpdateResourceSelectAll = (resource: string, checked: boolean) => {
    setUpdateRole((prev) => {
      const newPermissions = { ...prev.permissions }

      if (checked) {
        // Select all actions for this resource
        newPermissions[resource] = actions.map((action) => action.id)
      } else {
        // Deselect all actions for this resource
        newPermissions[resource] = []
      }

      return { ...prev, permissions: newPermissions }
    })
  }

  const getResourceSelectAllState = (resource: string) => {
    const resourceActions = newRole.permissions[resource] || []
    const totalActions = actions.length

    if (resourceActions.length === 0) {
      return { checked: false, indeterminate: false }
    } else if (resourceActions.length === totalActions) {
      return { checked: true, indeterminate: false }
    } else {
      return { checked: false, indeterminate: true }
    }
  }

  const getUpdateResourceSelectAllState = (resource: string) => {
    const resourceActions = updateRole.permissions[resource] || []
    const totalActions = actions.length

    if (resourceActions.length === 0) {
      return { checked: false, indeterminate: false }
    } else if (resourceActions.length === totalActions) {
      return { checked: true, indeterminate: false }
    } else {
      return { checked: false, indeterminate: true }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Quản lý Role & Permission" description="Quản lý vai trò và quyền hạn trong hệ thống" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Role & Permission"
        description="Quản lý vai trò và quyền hạn trong hệ thống"
        action={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Tạo role mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tạo role mới</DialogTitle>
                <DialogDescription>Tạo role mới với các quyền hạn tùy chỉnh</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-name">Tên role *</Label>
                    <Input
                      id="role-name"
                      placeholder="Nhập tên role..."
                      value={newRole.name}
                      onChange={(e) => setNewRole((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role-description">Mô tả</Label>
                    <Textarea
                      id="role-description"
                      placeholder="Nhập mô tả role..."
                      value={newRole.description}
                      onChange={(e) => setNewRole((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Quyền hạn *</Label>
                  <div className="border rounded-lg p-4">
                    <div className="grid gap-6">
                      {resources.map((resource) => {
                        const selectAllState = getResourceSelectAllState(resource.id)
                        return (
                          <div key={resource.id} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {getResourceIcon(resource.id)}
                                <Label className="font-medium">{resource.name}</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckboxWithIndeterminate
                                  id={`select-all-${resource.id}`}
                                  checked={selectAllState.checked}
                                  indeterminate={selectAllState.indeterminate}
                                  onCheckedChange={(checked: boolean) =>
                                    handleResourceSelectAll(resource.id, checked)
                                  }
                                />
                                <Label
                                  htmlFor={`select-all-${resource.id}`}
                                  className="text-sm cursor-pointer text-blue-600 font-medium"
                                >
                                  Chọn tất cả
                                </Label>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-6">
                              {actions.map((action) => (
                                <div key={action.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${resource.id}-${action.id}`}
                                    checked={newRole.permissions[resource.id]?.includes(action.id) || false}
                                    onCheckedChange={(checked: boolean) =>
                                      handlePermissionChange(resource.id, action.id, checked)
                                    }
                                  />
                                  <Label htmlFor={`${resource.id}-${action.id}`} className="text-sm cursor-pointer">
                                    {action.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    setNewRole({ name: "", description: "", permissions: {} })
                  }}
                  disabled={isCreating}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreateRole} disabled={isCreating}>
                  {isCreating ? "Đang tạo..." : "Tạo role"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Update Role Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cập nhật role: {selectedRole?.name}</DialogTitle>
            <DialogDescription>Chỉnh sửa thông tin và quyền hạn của role</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="update-role-name">Tên role *</Label>
                <Input
                  id="update-role-name"
                  placeholder="Nhập tên role..."
                  value={updateRole.name}
                  onChange={(e) => setUpdateRole((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="update-role-description">Mô tả</Label>
                <Textarea
                  id="update-role-description"
                  placeholder="Nhập mô tả role..."
                  value={updateRole.description ?? ""}
                  onChange={(e) => setUpdateRole((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Quyền hạn *</Label>
              <div className="border rounded-lg p-4">
                <div className="grid gap-6">
                  {resources.map((resource) => {
                    const selectAllState = getUpdateResourceSelectAllState(resource.id)
                    return (
                      <div key={resource.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getResourceIcon(resource.id)}
                            <Label className="font-medium">{resource.name}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckboxWithIndeterminate
                              id={`update-select-all-${resource.id}`}
                              checked={selectAllState.checked}
                              indeterminate={selectAllState.indeterminate}
                              onCheckedChange={(checked: boolean) =>
                                handleUpdateResourceSelectAll(resource.id, checked)
                              }
                            />
                            <Label
                              htmlFor={`update-select-all-${resource.id}`}
                              className="text-sm cursor-pointer text-blue-600 font-medium"
                            >
                              Chọn tất cả
                            </Label>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-6">
                          {actions.map((action) => (
                            <div key={action.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`update-${resource.id}-${action.id}`}
                                checked={updateRole.permissions[resource.id]?.includes(action.id) || false}
                                onCheckedChange={(checked: boolean) =>
                                  handleUpdatePermissionChange(resource.id, action.id, checked)
                                }
                              />
                              <Label htmlFor={`update-${resource.id}-${action.id}`} className="text-sm cursor-pointer">
                                {action.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsUpdateDialogOpen(false)
                setSelectedRole(null)
                setUpdateRole({ name: "", description: "", permissions: {} })
              }}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateRole} disabled={isUpdating}>
              {isUpdating ? "Đang cập nhật..." : "Cập nhật role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa role</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa role này? Thao tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="text-red-600 text-sm mb-2 p-2 bg-red-50 rounded">
              {deleteError}
            </div>
          )}
          <DialogFooter className="flex flex-col gap-2">
            <Button 
              onClick={handleDeleteRole} 
              disabled={isDeleting} 
              className="bg-red-600 hover:bg-red-700 w-full"
            >
              {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
            <DialogClose asChild>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                disabled={isDeleting}
              >
                Hủy
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tìm kiếm role</CardTitle>
          <CardDescription>Tìm kiếm role theo tên hoặc mô tả</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 transition-colors duration-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.length > 0 ? (
          filteredRoles.map((role) => (
            <Card key={role.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg capitalize">{role.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50 transition-colors"
                        onSelect={(e) => {
                          e.preventDefault();
                          handleOpenDelete(role.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa role
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="text-sm leading-relaxed">{role.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">

                {/* Permissions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Quyền hạn:</h4>
                  <div className="space-y-2">
                    <div style={{maxHeight: '180px', overflowY: 'auto'}}>
                      {role.permissions.map((permission, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors mb-2">
                          <div className="flex items-center space-x-2 mb-2">
                            {getResourceIcon(permission.resource)}
                            <span className="text-sm font-medium capitalize">{permission.resource}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {permission.actions.map((action) => (
                              <Badge key={action} className={`text-xs ${getActionBadgeColor(action)}`}>
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    className="w-full hover:bg-blue-50 hover:text-blue-700 transition-colors bg-transparent"
                    onClick={() => openUpdateDialog(role)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Cập nhật role
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <Shield className="h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">Không tìm thấy role nào phù hợp với từ khóa "{searchTerm}"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoleManagement
