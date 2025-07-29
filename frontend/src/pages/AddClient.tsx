import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import API_BASE_URL from "../config";
const AddClient = () => {
  const { userId } = useParams();
  const isEditMode = !!userId;
  
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    customerCode: "",
    aadharNumber: "",
    panNumber: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isEditMode && userId) {
      fetchUserData();
    }
  }, [isEditMode, userId]);

  const fetchUserData = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setNewUser({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          mobileNumber: userData.mobileNumber || "",
          customerCode: userData.customerCode || "",
          aadharNumber: userData.aadharNumber || "",
          panNumber: userData.panNumber || "",
          password: "", // Don't populate password for security
        });
      } else {
        alert("Failed to fetch user data");
        navigate("/admin");
      }
    } catch (error) {
      alert("Failed to fetch user data");
      navigate("/admin");
    } finally {
      setIsFetching(false);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!newUser.firstName) newErrors.firstName = "First name is required";
    if (!newUser.lastName) newErrors.lastName = "Last name is required";
    if (!newUser.email) newErrors.email = "Email is required";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(newUser.email))
      newErrors.email = "Invalid email format";
    if (!newUser.mobileNumber)
      newErrors.mobileNumber = "Phone number is required";
    if (!newUser.customerCode)
      newErrors.customerCode = "Client code is required";
    // Only validate password for new users or if password is being changed
    if (!isEditMode && !newUser.password) newErrors.password = "Password is required";
    else if (newUser.password && newUser.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    
    try {
      const url = isEditMode 
        ? `${API_BASE_URL}/api/admin/users/${userId}`
        : `${API_BASE_URL}/api/admin/users`;
      
      const method = isEditMode ? "PUT" : "POST";
      
      // For edit mode, only include password if it's being changed
      const requestBody = isEditMode 
        ? { ...newUser, role: "client", ...(newUser.password && { password: newUser.password }) }
        : { ...newUser, role: "client" };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      if (response.ok) {
        navigate("/admin"); // Redirect to admin dashboard or user management
      } else if (response.status === 409) {
        alert("User already present");
      } else {
        alert(isEditMode ? "Failed to update user" : "Failed to add user");
      }
    } catch (error) {
      alert(isEditMode ? "Failed to update user" : "Failed to add user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-2xl shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              {isEditMode ? "Edit Client" : "Add Client"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name*</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                    required
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name*</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                    required
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email*</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Phone Number*</Label>
                  <Input
                    id="mobileNumber"
                    value={newUser.mobileNumber}
                    onChange={(e) =>
                      setNewUser({ ...newUser, mobileNumber: e.target.value })
                    }
                    required
                  />
                  {errors.mobileNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerCode">Client Code*</Label>
                  <Input
                    id="customerCode"
                    value={newUser.customerCode}
                    onChange={(e) =>
                      setNewUser({ ...newUser, customerCode: e.target.value })
                    }
                    required
                  />
                  {errors.customerCode && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.customerCode}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadharNumber">Aadhar Number</Label>
                  <Input
                    id="aadharNumber"
                    value={newUser.aadharNumber}
                    onChange={(e) =>
                      setNewUser({ ...newUser, aadharNumber: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input
                    id="panNumber"
                    value={newUser.panNumber}
                    onChange={(e) =>
                      setNewUser({ ...newUser, panNumber: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    {isEditMode ? "Password (leave blank to keep current)" : "Password*"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required={!isEditMode}
                    placeholder={isEditMode ? "Enter new password or leave blank" : ""}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                className="w-full mt-6"
                size="lg"
                disabled={isLoading || isFetching}
              >
                {isLoading 
                  ? (isEditMode ? "Updating..." : "Adding...") 
                  : (isEditMode ? "Update Client" : "Add Client")
                }
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddClient;
