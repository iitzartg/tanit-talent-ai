import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { analyticsData } from "@/data/mockData";

const COLORS = ["hsl(174, 62%, 32%)", "hsl(36, 90%, 55%)", "hsl(210, 70%, 50%)", "hsl(152, 60%, 40%)", "hsl(0, 72%, 51%)"];

export const ViewsChart = () => (
  <Card className="p-6">
    <h3 className="font-display font-semibold text-foreground mb-4">Monthly Views & Applications</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={analyticsData.monthlyViews}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 10%, 88%)" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="views" fill="hsl(174, 62%, 32%)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="applications" fill="hsl(36, 90%, 55%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

export const SkillsChart = () => (
  <Card className="p-6">
    <h3 className="font-display font-semibold text-foreground mb-4">Top Skills in Demand</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={analyticsData.topSkills} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 10%, 88%)" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis dataKey="skill" type="category" tick={{ fontSize: 12 }} width={80} />
        <Tooltip />
        <Bar dataKey="count" fill="hsl(174, 62%, 32%)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

export const CategoryChart = () => (
  <Card className="p-6">
    <h3 className="font-display font-semibold text-foreground mb-4">Jobs by Category</h3>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={analyticsData.jobsByCategory} cx="50%" cy="50%" outerRadius={100} dataKey="count" nameKey="category" label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
          {analyticsData.jobsByCategory.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </Card>
);

export const TrendChart = () => (
  <Card className="p-6">
    <h3 className="font-display font-semibold text-foreground mb-4">Application Trend</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={analyticsData.monthlyViews}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 10%, 88%)" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="applications" stroke="hsl(174, 62%, 32%)" strokeWidth={3} dot={{ fill: "hsl(174, 62%, 32%)" }} />
        <Line type="monotone" dataKey="views" stroke="hsl(36, 90%, 55%)" strokeWidth={2} strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);
