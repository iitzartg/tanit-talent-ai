import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { UserRole } from "@/lib/auth";

const AdminCreateUser = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "candidat" as UserRole,
    bio: "",
    skills: "",
    cvPath: "",
  });

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.name.trim().length < 2) {
      toast({ title: "Invalid name", description: "Name must be at least 2 characters.", variant: "destructive" });
      return;
    }
    if (!form.email.includes("@")) {
      toast({ title: "Invalid email", description: "Please provide a valid email.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await api.createUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        bio: form.bio.trim(),
        skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean),
        cvPath: form.cvPath.trim(),
      });
      toast({ title: "User created", description: "The new user has been added successfully." });
      navigate("/admin/users");
    } catch (error) {
      toast({
        title: "Create failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Create User</h1>
        <Link to="/admin/users">
          <Button type="button" variant="outline">
            Back to list
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <form className="space-y-4" onSubmit={(event) => void submit(event)}>
          <input className="w-full rounded-md border border-border bg-background px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          <input className="w-full rounded-md border border-border bg-background px-3 py-2" placeholder="Email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          <select className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}>
            <option value="candidat">candidat</option>
            <option value="recruteur">recruteur</option>
            <option value="admin">admin</option>
          </select>
          <textarea className="w-full rounded-md border border-border bg-background px-3 py-2" placeholder="Bio (optional)" rows={4} value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} />
          <input className="w-full rounded-md border border-border bg-background px-3 py-2" placeholder="Skills separated by commas" value={form.skills} onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))} />
          <input className="w-full rounded-md border border-border bg-background px-3 py-2" placeholder="CV path (optional)" value={form.cvPath} onChange={(e) => setForm((prev) => ({ ...prev, cvPath: e.target.value }))} />
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create user"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminCreateUser;
