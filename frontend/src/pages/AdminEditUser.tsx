import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { UserRole } from "@/lib/auth";

const AdminEditUser = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "candidat" as UserRole,
    bio: "",
    skills: "",
    cvPath: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.getUserById(id);
        setForm({
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          bio: response.profile?.bio || "",
          skills: response.profile?.skills?.join(", ") || "",
          cvPath: response.profile?.cvPath || "",
        });
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

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.updateUser(id, {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        bio: form.bio.trim(),
        skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean),
        cvPath: form.cvPath.trim(),
      });
      toast({ title: "User updated", description: "Changes were saved successfully." });
      navigate("/admin/users");
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground">Loading user...</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Edit User</h1>
        <Link to="/admin/users">
          <Button type="button" variant="outline">
            Back to list
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <form className="space-y-4" onSubmit={(event) => void submit(event)}>
          <input className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          <input className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          <select className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}>
            <option value="candidat">candidat</option>
            <option value="recruteur">recruteur</option>
            <option value="admin">admin</option>
          </select>
          <textarea className="w-full rounded-md border border-border bg-background px-3 py-2" rows={4} value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} />
          <input className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.skills} onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))} />
          <input className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.cvPath} onChange={(e) => setForm((prev) => ({ ...prev, cvPath: e.target.value }))} />
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminEditUser;
