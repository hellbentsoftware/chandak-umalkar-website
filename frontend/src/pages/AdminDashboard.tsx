
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import UserManagement from '@/components/admin/UserManagement';
import DocumentManagement from '@/components/admin/DocumentManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, BarChart3, TrendingUp, Shield, Clock, Activity, Database, Server, HardDrive } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-4xl font-bold mb-3 gradient-text">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive control center for user and document management
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-up">
          <Card className="stat-card group hover:scale-105 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">156</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-green-600 font-medium">+12%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="stat-card group hover:scale-105 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Documents Uploaded</CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">2,847</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-green-600 font-medium">+18%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="stat-card group hover:scale-105 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
              <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">429</div>
              <p className="text-sm text-muted-foreground">
                New uploads this month
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card group hover:scale-105 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
              <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">24</div>
              <p className="text-sm text-muted-foreground">
                Users currently online
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 animate-fade-up">
          <TabsList className="glass-effect grid w-full grid-cols-3 p-2 h-14">
            <TabsTrigger value="overview" className="flex items-center space-x-2 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4" />
              <span className="font-medium">User Management</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Document Management</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 animate-scale-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* System Health Card */}
              <Card className="card-enhanced col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>System Health</span>
                  </CardTitle>
                  <CardDescription>Real-time system monitoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg dark:bg-green-900/20">
                    <div className="flex items-center space-x-2">
                      <Server className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Server Status</span>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium dark:bg-green-800 dark:text-green-100">Online</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg dark:bg-green-900/20">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Database</span>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium dark:bg-green-800 dark:text-green-100">Connected</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg dark:bg-yellow-900/20">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Storage</span>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium dark:bg-yellow-800 dark:text-yellow-100">75% Used</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Card */}
              <Card className="card-enhanced col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Recent Activity</span>
                  </CardTitle>
                  <CardDescription>Latest system events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New user registered</p>
                      <p className="text-xs text-muted-foreground">john.doe@example.com</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg dark:bg-green-900/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Document uploaded</p>
                      <p className="text-xs text-muted-foreground">Form 16 - 2024</p>
                      <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg dark:bg-purple-900/20">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">System backup completed</p>
                      <p className="text-xs text-muted-foreground">Daily backup successful</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="card-enhanced col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <span>Quick Actions</span>
                  </CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button className="w-full p-3 text-left bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Manage Users</span>
                    </div>
                  </button>
                  <button className="w-full p-3 text-left bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Review Documents</span>
                    </div>
                  </button>
                  <button className="w-full p-3 text-left bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">View Analytics</span>
                    </div>
                  </button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
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
