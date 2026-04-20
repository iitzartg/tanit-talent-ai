import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type UserWithProfile = AuthUser & { profile: { bio?: string } | null };

const AdminUsersList = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await api.getUsers();
        setUsers(response.users);
      } catch (error) {
        toast({
          title: "Failed to load users",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void loadUsers();
  }, [toast]);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      toast({ title: "User deleted", description: "The user was removed successfully." });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage all users with complete CRUD operations.</p>
        </div>
        <Link to="/admin/users/new">
          <Button type="button">Create User</Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Email</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Role</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Profile</th>
                <th className="p-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="p-4 text-sm text-muted-foreground" colSpan={5}>
                    Loading users...
                  </td>
                </tr>
              )}

              {!loading && users.length === 0 && (
                <tr>
                  <td className="p-4 text-sm text-muted-foreground" colSpan={5}>
                    No users found.
                  </td>
                </tr>
              )}

              {!loading &&
                users.map((user) => (
                  <tr key={user.id} className="border-t border-border">
                    <td className="p-4 text-sm font-medium text-foreground">{user.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {user.profile?.bio ? "Completed" : "Missing"}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/users/${user.id}`}>
                          <Button type="button" variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link to={`/admin/users/${user.id}/edit`}>
                          <Button type="button" variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button type="button" variant="destructive" size="sm" onClick={() => void handleDelete(user.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminUsersList;
