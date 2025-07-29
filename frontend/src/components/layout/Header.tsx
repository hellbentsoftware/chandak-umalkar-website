
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings, Bell, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border px-6 py-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CU</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                <button 
                  onClick={handleDashboardClick}
                  className="hover:no-underline focus:outline-none cursor-pointer"
                >
                  Chandak Umalkar Associates
                </button>
              </h1>
              <p className="text-sm text-muted-foreground">
                {user?.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">{user?.firstName} {user?.lastName}</div>
                  <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleDashboardClick}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
