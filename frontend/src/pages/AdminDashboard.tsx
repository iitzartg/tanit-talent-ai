import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "@/components/StatCard";
import { ViewsChart, SkillsChart, TrendChart, CategoryChart } from "@/components/Charts";
import { Brain, Users, Briefcase, Shield, BarChart3, Activity, LogOut, Bell } from "lucide-react";
import { mockCandidates, mockJobs, analyticsData } from "@/data/mockData";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { type AuthUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useAppSignOut } from "@/hooks/useAppSignOut";

const AdminDashboard = () => {
  const { toast } = useToast();
  const signOutApp = useAppSignOut();
  const [users, setUsers] = useState<Array<AuthUser & { profile: { bio?: string } | null }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const result = await api.getUsers();
        setUsers(result.users);
      } catch (error) {
        await signOutApp();
        toast({
          title: "Session expired",
          description: "Please login as admin again.",
          variant: "destructive",
        });
      } finally {
        setLoadingUsers(false);
      }
    };
    void loadUsers();
  }, [toast, signOutApp]);

  const handleLogout = () => {
    void signOutApp();
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await api.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast({ title: "User deleted", description: "The user account has been removed." });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Could not delete user.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Tanit-Talent</span>
            <Badge className="bg-destructive/10 text-destructive text-xs">Admin</Badge>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon"><Bell className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">System overview and user management</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Users" value={analyticsData.totalCandidates + 156} icon={Users} trend={{ value: 18, positive: true }} />
          <StatCard title="Active Jobs" value={analyticsData.totalJobs} icon={Briefcase} />
          <StatCard title="Applications" value={analyticsData.totalApplications} icon={Activity} trend={{ value: 32, positive: true }} />
          <StatCard title="Platform Health" value="99.9%" icon={Shield} />
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ViewsChart />
              <TrendChart />
              <SkillsChart />
              <CategoryChart />
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="mb-4 flex justify-end">
              <Link to="/admin/users">
                <Button variant="outline" size="sm" type="button">
                  Open Full CRUD Manager
                </Button>
              </Link>
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">AI Score</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers && (
                      <tr className="border-t border-border hover:bg-muted/30">
                        <td className="p-4 text-sm text-muted-foreground" colSpan={5}>
                          Loading users...
                        </td>
                      </tr>
                    )}
                    {!loadingUsers && users.map(c => (
                      <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                              {c.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{c.name}</p>
                              <p className="text-xs text-muted-foreground">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4"><Badge variant="outline" className="text-xs">{c.role}</Badge></td>
                        <td className="p-4"><Badge className="text-xs bg-success/10 text-success">active</Badge></td>
                        <td className="p-4 text-sm font-medium">{c.profile?.bio ? "Profile set" : "N/A"}</td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteUser(c.id)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-display font-semibold text-foreground mb-4">System Status</h3>
                <div className="space-y-3">
                  {[
                    { name: "API Gateway", status: "Operational" },
                    { name: "AI Microservice", status: "Operational" },
                    { name: "Database (PostgreSQL)", status: "Operational" },
                    { name: "File Storage", status: "Operational" },
                  ].map(s => (
                    <div key={s.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-foreground">{s.name}</span>
                      <Badge className="bg-success/10 text-success text-xs">{s.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-display font-semibold text-foreground mb-4">Clickstream Analytics</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Events Today</span><span className="font-bold text-foreground">14,892</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Unique Sessions</span><span className="font-bold text-foreground">2,341</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Avg. Session Duration</span><span className="font-bold text-foreground">4m 23s</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Bounce Rate</span><span className="font-bold text-foreground">32.1%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Most Viewed Job</span><span className="font-bold text-foreground">Senior Dev</span></div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
