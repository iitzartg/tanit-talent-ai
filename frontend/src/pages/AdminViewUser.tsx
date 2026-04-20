import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";
import type { ApiProfile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const AdminViewUser = () => {
  const { id = "" } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ApiProfile | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.getUserById(id);
        setUser(response.user);
        setProfile(response.profile);
      } catch (error) {
        toast({
          title: "Failed to load user",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, [id, toast]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground">Loading user...</div>;
  }

  if (!user) {
    return <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground">User not found.</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">User Details</h1>
        <div className="flex gap-2">
          <Link to={`/admin/users/${user.id}/edit`}>
            <Button type="button" variant="outline">
              Edit user
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button type="button" variant="outline">
              Back to list
            </Button>
          </Link>
        </div>
      </div>

      <Card className="space-y-3 p-6">
        <p>
          <span className="font-medium">Name:</span> {user.name}
        </p>
        <p>
          <span className="font-medium">Email:</span> {user.email}
        </p>
        <p>
          <span className="font-medium">Role:</span> <Badge variant="outline">{user.role}</Badge>
        </p>
        <p>
          <span className="font-medium">Created:</span> {new Date(user.createdAt).toLocaleString()}
        </p>
        <p>
          <span className="font-medium">Bio:</span> {profile?.bio || "No bio"}
        </p>
        <p>
          <span className="font-medium">Skills:</span> {profile?.skills?.length ? profile.skills.join(", ") : "No skills"}
        </p>
        <p>
          <span className="font-medium">CV Path:</span> {profile?.cvPath || "Not set"}
        </p>
      </Card>
    </div>
  );
};

export default AdminViewUser;
