import React from "react";
import Header from "@/components/layout/Header";
import DocumentUpload from "@/components/user/DocumentUpload";
import MyDocuments from "@/components/user/MyDocuments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Upload,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Target,
  Award,
  Star,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import API_BASE_URL from "../config";
const UserDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = React.useState({
    documentsUploaded: 0,
    newUploadsThisMonth: 0,
    loading: true,
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/stats`, {
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
        setStats((s) => ({ ...s, loading: false }));
      }
    };
    if (token) fetchStats();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      <Header />

      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-4xl font-bold mb-3 gradient-text">
            Welcome back!
          </h1>
          <p className="text-lg text-muted-foreground">
            Streamline your taxation document management with ease
          </p>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-up">
          <Card className="stat-card group hover:scale-105 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Documents Uploaded
              </CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats.loading ? "..." : stats.documentsUploaded}
              </div>
              <p className="text-sm text-muted-foreground">Across all years</p>
            </CardContent>
          </Card>
          <Card className="stat-card group hover:scale-105 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
              <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <Upload className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats.loading ? "..." : stats.newUploadsThisMonth}
              </div>
              <p className="text-sm text-muted-foreground">
                New uploads this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Document Status Overview
        <Card className="mb-8 card-enhanced animate-fade-up">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Document Status Overview</span>
            </CardTitle>
            <CardDescription>Track your document upload progress across all categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100">Aadhar Card</p>
                  <p className="text-xs text-green-700 dark:text-green-300 flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Verified & Uploaded
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100">PAN Card</p>
                  <p className="text-xs text-green-700 dark:text-green-300 flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Verified & Uploaded
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200/50 dark:border-yellow-700/50">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">Form 16</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">Under Review</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200/50 dark:border-red-700/50">
                <div className="p-2 bg-red-500 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-900 dark:text-red-100">Other Docs</p>
                  <p className="text-xs text-red-700 dark:text-red-300">Action Required</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Enhanced Tabs */}
        <Tabs defaultValue="upload" className="space-y-6 animate-fade-up">
          <TabsList className="glass-effect grid w-full grid-cols-2 p-2 h-14">
            <TabsTrigger
              value="upload"
              className="flex items-center space-x-2 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Upload className="h-4 w-4" />
              <span className="font-medium">Upload Documents</span>
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="flex items-center space-x-2 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">My Documents</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="animate-scale-in">
            <DocumentUpload />
          </TabsContent>

          <TabsContent value="documents" className="animate-scale-in">
            <MyDocuments />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
