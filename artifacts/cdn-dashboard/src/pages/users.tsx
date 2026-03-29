import * as React from "react";
import { useListUsers, useUpdateUser } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users as UsersIcon, ShieldAlert, Activity } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function Users() {
  const { data: users, isLoading, error } = useListUsers();
  const updateRoleMutation = useUpdateUser();
  const queryClient = useQueryClient();

  if (isLoading) {
    return <div className="flex justify-center py-20"><Activity className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Handle 403 Forbidden naturally
  if (error && (error as any).status === 403) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">You must be a superadmin to view and manage users.</p>
      </div>
    );
  }

  const handleRoleChange = async (userId: string, newRole: "superadmin"|"admin"|"user") => {
    try {
      await updateRoleMutation.mutateAsync({
        userId,
        data: { role: newRole }
      });
      toast.success("User role updated");
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    } catch(e: any) {
      toast.error(e.message || "Failed to update role");
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch(role) {
      case 'superadmin': return 'default';
      case 'admin': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Access Management</h1>
        <p className="text-muted-foreground mt-1">Manage team members and their roles.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 border-b border-white/10 uppercase tracking-wider text-muted-foreground text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                        {user.username[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getRoleBadgeVariant(user.role) as any} className="capitalize">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      className="bg-background border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors disabled:opacity-50"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                      disabled={updateRoleMutation.isPending}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users?.length && (
            <div className="p-8 text-center text-muted-foreground">No users found.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
