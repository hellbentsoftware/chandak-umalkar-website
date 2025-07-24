import React, { useState } from "react";
import Header from "@/components/layout/Header";
import UserManagement from "@/components/admin/UserManagement";
import DocumentManagement from "@/components/admin/DocumentManagement";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  FileText,
  BarChart3,
  TrendingUp,
  Shield,
  Clock,
  Activity,
  Database,
  Server,
  HardDrive,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import API_BASE_URL from "../config";

const AdminDashboard = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    documentsUploaded: 0,
    newUploadsThisMonth: 0,
    activeSessions: 0,
    loading: true,
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStats({ ...data, loading: false });
        } else {
          throw new Error("Failed to fetch stats");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load statistics",
          variant: "destructive",
        });
        setStats((s) => ({ ...s, loading: false }));
      }
    };
    fetchStats();
  }, [token]);

  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      <Header />

      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-4xl font-bold mb-3 gradient-text">
            Admin Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive control center for user and document management
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-up">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
              Total Users
              <span className="inline-block bg-gray-100 p-1 rounded-full">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m9-4a4 4 0 1 0-8 0 4 4 0 0 0 8 0z"
                  />
                </svg>
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {stats.loading ? "..." : stats.totalUsers}
            </div>
          </div>
          <div
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:bg-purple-50 transition"
            onClick={() => setActiveTab("documents")}
          >
            <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
              Documents Uploaded
              <span className="inline-block bg-purple-100 p-1 rounded-full">
                <svg
                  className="w-4 h-4 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 4H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"
                  />
                </svg>
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {stats.loading ? "..." : stats.documentsUploaded}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
              This Month
              <span className="inline-block bg-orange-100 p-1 rounded-full">
                <svg
                  className="w-4 h-4 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3v18h18M3 9h18M9 21V9"
                  />
                </svg>
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {stats.loading ? "..." : stats.newUploadsThisMonth}
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6 animate-fade-up"
        >
          <TabsList className="glass-effect grid w-full grid-cols-2 p-2 h-14">
            <TabsTrigger
              value="users"
              className="flex items-center space-x-2 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="h-4 w-4" />
              <span className="font-medium">Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="flex items-center space-x-2 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">Documents</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="animate-scale-in">
            <UserManagement />
          </TabsContent>

          <TabsContent value="documents" className="animate-scale-in">
            <DocumentManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
