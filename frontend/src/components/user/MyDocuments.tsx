import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import API_BASE_URL from "../../config";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { FileText, Download, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  fileName: string;
  fileType: "aadhar" | "pan" | "form16" | "other";
  year: string;
  uploadDate: string;
  fileUrl: string;
  fileSize?: number; // Added optional file size
  mimeType?: string; // Added optional mime type
}

const MyDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isDownloading, setIsDownloading] = useState<string | null>(null); // Track download state
  const { token } = useAuth();
  const { toast } = useToast();

  const documentTypes = [
    { value: "aadhar", label: "Aadhar Card" },
    { value: "pan", label: "PAN Card" },
    { value: "form16", label: "Form 16" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, yearFilter, typeFilter]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/documents/my-documents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch documents.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch documents.",
        variant: "destructive",
      });
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter((doc) =>
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (yearFilter && yearFilter !== "all-years") {
      filtered = filtered.filter((doc) => doc.year === yearFilter);
    }

    if (typeFilter && typeFilter !== "all-types") {
      filtered = filtered.filter((doc) => doc.fileType === typeFilter);
    }

    setFilteredDocuments(filtered);
  };

  // Updated download function to properly handle file downloads
  const handleDownload = async (
    fileUrl: string,
    fileName: string,
    documentId: string
  ) => {
    try {
      setIsDownloading(documentId);

      const response = await fetch(`${API_BASE_URL}${fileUrl}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Try to parse the response JSON to extract the message
        const errorData = await response.json();
        const errorMessage = errorData?.message || "Download failed";
        throw new Error(errorMessage);
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download URL
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Document downloaded successfully.",
      });
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to download document.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/documents/${documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Document deleted successfully.",
        });
        fetchDocuments();
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document.",
        variant: "destructive",
      });
    }
  };

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 10; i--) {
      years.push(i.toString());
    }
    return years;
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find((t) => t.value === type);
    return docType ? docType.label : type;
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getDocumentsByYear = () => {
    const grouped = filteredDocuments.reduce((acc, doc) => {
      if (!acc[doc.year]) {
        acc[doc.year] = [];
      }
      acc[doc.year].push(doc);
      return acc;
    }, {} as Record<string, Document[]>);

    return Object.entries(grouped).sort(
      ([a], [b]) => parseInt(b) - parseInt(a)
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Documents</h2>
        <p className="text-muted-foreground">
          View and manage your uploaded documents
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter your documents by name, year, or type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by file name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-years">All years</SelectItem>
                {getYears().map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All types</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {getDocumentsByYear().map(([year, docs]) => (
        <Card key={year}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents for {year}
            </CardTitle>
            <CardDescription>
              {docs.length} document{docs.length !== 1 ? "s" : ""} uploaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Type</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>File Size</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {getDocumentTypeLabel(document.fileType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {document.fileName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {document.fileSize
                        ? formatFileSize(document.fileSize)
                        : "Unknown"}
                    </TableCell>
                    <TableCell>
                      {new Date(document.uploadDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownload(
                              document.fileUrl,
                              document.fileName,
                              document.id
                            )
                          }
                          disabled={isDownloading === document.id}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {isDownloading === document.id
                            ? "Downloading..."
                            : "Download"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(document.id)}
                          disabled={isDownloading === document.id}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-muted-foreground">
              {documents.length === 0
                ? "You haven't uploaded any documents yet."
                : "No documents match your current filters."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyDocuments;
