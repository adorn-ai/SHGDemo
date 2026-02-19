import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { DocumentViewer } from "../DocumentViewer";
import { getMembers, saveMember, approveMember, rejectMember } from "../../lib/store";
import { getSession, hasPermission } from "../../lib/auth";
import { toast } from "sonner@2.0.3";
import {
  Search,
  Download,
  Eye,
  Check,
  X,
  Mail,
  Phone,
  Calendar,
  FileText,
  FilePlus,
} from "lucide-react";
import readXlsxFile from "read-excel-file";

export function Members() {
  const session = getSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const members = getMembers();
  const activeMembers = members.filter((m) => m.status === "active");
  const pendingMembers = members.filter((m) => m.status === "pending");

  const filteredActive = activeMembers.filter((m) =>
    `${m.firstName} ${m.lastName} ${m.memberId} ${m.email} ${m.phone}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const canApprove = hasPermission(session?.role || "treasurer", "approve_member");

  const handleApprove = (memberId: string) => {
    approveMember(memberId);
    toast.success("Member approved successfully!");
  };

  const handleReject = (memberId: string) => {
    rejectMember(memberId);
    toast.success("Member registration rejected");
  };

  const exportToCSV = () => {
    const headers = ["Member ID", "Name", "Email", "Phone", "Join Date", "Status"];
    const rows = activeMembers.map((m) => [
      m.memberId,
      `${m.firstName} ${m.lastName}`,
      m.email,
      m.phone,
      m.joinDate,
      m.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "members.csv";
    a.click();
    toast.success("Members exported successfully!");
  };

  const handleExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    e.target.value = ""; // reset so same file can be re-imported

    try {
      const rows = await readXlsxFile(file);

      if (rows.length < 2) {
        toast.error("Excel file is empty or has no data rows");
        return;
      }

      // Detect column positions from header row (case-insensitive)
      const headers = rows[0].map((h) => String(h ?? "").trim().toLowerCase());
      const col = {
        memberId: headers.findIndex((h) => h.includes("member id") || h.includes("memberid")),
        name:     headers.findIndex((h) => h === "name"),
        email:    headers.findIndex((h) => h === "email"),
        phone:    headers.findIndex((h) => h === "phone"),
        status:   headers.findIndex((h) => h === "status"),
      };
      // Fallback to positional order if headers aren't found
      if (col.memberId === -1) col.memberId = 0;
      if (col.name     === -1) col.name     = 1;
      if (col.email    === -1) col.email    = 2;
      if (col.phone    === -1) col.phone    = 3;
      if (col.status   === -1) col.status   = 4;

      const existingIds = new Set(members.map((m) => m.memberId));
      let added = 0;
      let skipped = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const memberId = String(row[col.memberId] ?? "").trim();
        if (!memberId) continue;

        // Skip if already in the store
        if (existingIds.has(memberId)) {
          skipped++;
          continue;
        }

        const fullName   = String(row[col.name]   ?? "").trim();
        const nameParts  = fullName.split(" ");
        const firstName  = nameParts[0] ?? "";
        const lastName   = nameParts.slice(1).join(" ") || "-";
        const email      = String(row[col.email]  ?? "").trim();
        const phone      = String(row[col.phone]  ?? "").trim();
        const statusRaw  = String(row[col.status] ?? "active").trim().toLowerCase();
        const status     = statusRaw === "active" ? "active" : "pending";

        const member = {
          id:              `member-${memberId}-${i}`,
          memberId,
          firstName,
          lastName,
          email,
          phone,
          dateOfBirth:     "",
          gender:          "",
          address:         "",
          city:            "Nairobi",
          state:           "Nairobi County",
          pincode:         "00100",
          aadharNumber:    "",
          panNumber:       "",
          bankName:        "",
          accountNumber:   "",
          ifscCode:        "",
          nomineeName:     "",
          nomineeRelation: "",
          joinDate:        new Date().toISOString().split("T")[0],
          status:          status as "active" | "pending",
        };

        saveMember(member);
        existingIds.add(memberId);
        added++;
      }

      if (added > 0) {
        toast.success(
          `Import complete: ${added} member${added > 1 ? "s" : ""} added` +
          (skipped > 0 ? `, ${skipped} skipped (already exist)` : "")
        );
      } else if (skipped > 0) {
        toast.info(`No new members — all ${skipped} already exist in the system`);
      } else {
        toast.error("No valid member rows found in the file");
      }
    } catch (err) {
      console.error("Excel import error:", err);
      toast.error("Failed to read Excel file. Make sure it is a valid .xlsx file.");
    }
  };

  const triggerImport = () => {
    document.getElementById("excel-upload")?.click();
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-full">
      <div className="px-4 md:px-0 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl text-[#2D5016]">Members</h1>
          <p className="text-sm md:text-base text-gray-600">
            Manage member registrations and information
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} className="bg-[#2D5016] hover:bg-[#4A7C2C] shrink-0" size="sm">
            <Download className="mr-1" size={14} />
            Export
          </Button>

          <input
            id="excel-upload"
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handleExcel}
          />

          <Button className="bg-blue-600 hover:bg-blue-700 shrink-0" size="sm" onClick={triggerImport}>
            <FilePlus className="mr-1" size={14} />
            Import
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 w-full">
        {/* Mobile: Dropdown */}
        <div className="px-4 md:hidden">
          <select
            className="w-full p-2 border rounded-lg text-sm bg-white"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="all">All Members ({activeMembers.length})</option>
            {canApprove && (
              <option value="pending">
                Pending ({pendingMembers.length}){pendingMembers.length > 0 ? " 🔴" : ""}
              </option>
            )}
          </select>
        </div>

        {/* Desktop: Tabs */}
        <div className="hidden md:block overflow-x-auto px-4 md:px-0">
          <TabsList className="inline-flex">
            <TabsTrigger value="all" className="text-xs md:text-sm whitespace-nowrap">
              All Members ({activeMembers.length})
            </TabsTrigger>
            {canApprove && (
              <TabsTrigger value="pending" className="relative text-xs md:text-sm whitespace-nowrap">
                Pending ({pendingMembers.length})
                {pendingMembers.length > 0 && (
                  <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="px-4 md:px-0">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Search className="text-gray-400 flex-shrink-0" size={20} />
                  <Input
                    placeholder="Search by name, ID, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-sm md:text-base border-0 focus:ring-0 p-0"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="px-4 md:px-0">
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
              <table className="border-collapse bg-white" style={{ minWidth: "800px", width: "100%" }}>
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs md:text-sm font-medium whitespace-nowrap">Member ID</th>
                    <th className="px-4 py-3 text-left text-xs md:text-sm font-medium whitespace-nowrap">Name</th>
                    <th className="px-4 py-3 text-left text-xs md:text-sm font-medium whitespace-nowrap">Email</th>
                    <th className="px-4 py-3 text-left text-xs md:text-sm font-medium whitespace-nowrap">Phone</th>
                    <th className="px-4 py-3 text-left text-xs md:text-sm font-medium whitespace-nowrap">Join Date</th>
                    <th className="px-4 py-3 text-left text-xs md:text-sm font-medium whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-left text-xs md:text-sm font-medium whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredActive.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No members found</td>
                    </tr>
                  ) : (
                    filteredActive.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-xs md:text-sm whitespace-nowrap">{member.memberId}</td>
                        <td className="px-4 py-3 text-xs md:text-sm whitespace-nowrap">{member.firstName} {member.lastName}</td>
                        <td className="px-4 py-3 text-xs md:text-sm whitespace-nowrap">{member.email}</td>
                        <td className="px-4 py-3 text-xs md:text-sm whitespace-nowrap">{member.phone}</td>
                        <td className="px-4 py-3 text-xs md:text-sm whitespace-nowrap">
                          {new Date(member.joinDate).toLocaleDateString("en-KE")}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-600 text-xs whitespace-nowrap">Active</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => { setSelectedMember(member); setDialogOpen(true); }}
                              title="View Details"
                            >
                              <Eye size={16} />
                            </Button>
                            {member.documents &&
                              (member.documents.passportPhoto || member.documents.nationalIdCopy || member.documents.kraCertificate) && (
                                <Button
                                  variant="ghost" size="sm"
                                  onClick={() => { setSelectedMember(member); setDocumentViewerOpen(true); }}
                                  title="View Documents"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <FileText size={16} />
                                </Button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {canApprove && (
          <TabsContent value="pending" className="space-y-4 px-4 md:px-0">
            {pendingMembers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-sm md:text-base text-gray-500">No pending member approvals</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-end">
                  <Button
                    onClick={() => { pendingMembers.forEach((m) => approveMember(m.id)); toast.success(`${pendingMembers.length} members approved!`); }}
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm md:text-base"
                  >
                    <Check className="mr-2" size={18} /> Approve All
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingMembers.map((member) => (
                    <Card key={member.id} className="border-orange-200">
                      <CardHeader>
                        <CardTitle className="text-base md:text-lg text-[#2D5016]">
                          {member.firstName} {member.lastName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Mail size={14} className="flex-shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Phone size={14} className="flex-shrink-0" />
                            <span>{member.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600 sm:col-span-2">
                            <Calendar size={14} className="flex-shrink-0" />
                            <span>Applied: {new Date(member.joinDate).toLocaleDateString("en-KE")}</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t space-y-2">
                          <p className="text-xs text-gray-600 break-words"><strong>ID Number:</strong> {member.aadharNumber}</p>
                          <p className="text-xs text-gray-600 break-words"><strong>KRA Pin:</strong> {member.panNumber}</p>
                          <p className="text-xs text-gray-600 break-words"><strong>Bank:</strong> {member.bankName} - {member.accountNumber}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-xs md:text-sm" onClick={() => handleApprove(member.id)}>
                            <Check className="mr-1" size={16} /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 border-red-600 text-red-600 hover:bg-red-50 text-xs md:text-sm" onClick={() => handleReject(member.id)}>
                            <X className="mr-1" size={16} /> Reject
                          </Button>
                          <Button size="sm" variant="ghost" className="sm:flex-none" onClick={() => { setSelectedMember(member); setDialogOpen(true); }}>
                            <Eye size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Member Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 md:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-[#2D5016] text-base md:text-lg">Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Member ID</p>
                  <p className="font-semibold text-sm md:text-base">{selectedMember.memberId}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Status</p>
                  <Badge className={selectedMember.status === "active" ? "bg-green-600" : "bg-orange-600"}>
                    {selectedMember.status}
                  </Badge>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 text-[#2D5016] text-sm md:text-base">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                  <div><p className="text-gray-600">Full Name</p><p className="font-medium break-words">{selectedMember.firstName} {selectedMember.lastName}</p></div>
                  <div><p className="text-gray-600">Email</p><p className="font-medium break-words">{selectedMember.email}</p></div>
                  <div><p className="text-gray-600">Phone</p><p className="font-medium">{selectedMember.phone}</p></div>
                  <div><p className="text-gray-600">Join Date</p><p className="font-medium">{new Date(selectedMember.joinDate).toLocaleDateString("en-KE")}</p></div>
                  {selectedMember.gender && <div><p className="text-gray-600">Gender</p><p className="font-medium">{selectedMember.gender}</p></div>}
                  {selectedMember.dateOfBirth && <div><p className="text-gray-600">Date of Birth</p><p className="font-medium">{selectedMember.dateOfBirth}</p></div>}
                </div>
              </div>
              {selectedMember.address && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 text-[#2D5016] text-sm md:text-base">Address</h3>
                  <p className="text-xs md:text-sm break-words">{selectedMember.address}</p>
                  <p className="text-xs md:text-sm break-words">{selectedMember.city}, {selectedMember.state} - {selectedMember.pincode}</p>
                </div>
              )}
              {(selectedMember.aadharNumber || selectedMember.panNumber) && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 text-[#2D5016] text-sm md:text-base">KYC Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                    <div><p className="text-gray-600">ID Number</p><p className="font-medium break-words">{selectedMember.aadharNumber}</p></div>
                    <div><p className="text-gray-600">KRA Number</p><p className="font-medium break-words">{selectedMember.panNumber}</p></div>
                  </div>
                </div>
              )}
              {selectedMember.bankName && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 text-[#2D5016] text-sm md:text-base">Banking Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                    <div><p className="text-gray-600">Bank Name</p><p className="font-medium break-words">{selectedMember.bankName}</p></div>
                    <div><p className="text-gray-600">Account Number</p><p className="font-medium break-words">{selectedMember.accountNumber}</p></div>
                    <div className="md:col-span-2"><p className="text-gray-600">Bank Branch</p><p className="font-medium break-words">{selectedMember.ifscCode}</p></div>
                  </div>
                </div>
              )}
              {selectedMember.nomineeName && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 text-[#2D5016] text-sm md:text-base">Nominee</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                    <div><p className="text-gray-600">Name</p><p className="font-medium break-words">{selectedMember.nomineeName}</p></div>
                    <div><p className="text-gray-600">Relation</p><p className="font-medium">{selectedMember.nomineeRelation}</p></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Viewer */}
      {selectedMember && (
        <DocumentViewer
          member={selectedMember}
          isOpen={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
        />
      )}
    </div>
  );
}