"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, MapPin, Clock, Camera } from "lucide-react"
import { getReportsByUser, type CivicReport } from "@/lib/firebase"

interface MyReportsProps {
  onBack: () => void
  phoneNumber: string
}

function formatTime(ts: number) {
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

export function MyReports({ onBack, phoneNumber }: MyReportsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [reports, setReports] = useState<CivicReport[]>([])
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null)

  useEffect(() => {
    let userId = '8122949677'
    getReportsByUser(userId).then(setReports).catch((e) => console.error(e))
  }, [phoneNumber])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-accent text-accent-foreground"
      case "resolved":
        return "bg-primary text-primary-foreground"
      case "pending":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.location.address.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || report.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [reports, searchQuery, statusFilter])

  if (selectedReport) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedReport(null)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Report Details</h1>
          </div>
        </header>

        <div className="p-4 space-y-6">
          {/* Report Image */}
          <div className="aspect-video rounded-lg overflow-hidden">
            <img
              src={selectedReport.images?.[0] || "/placeholder.svg"}
              alt={selectedReport.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Report Info */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{selectedReport.title}</h2>
              <Badge className={getStatusColor(selectedReport.status)}>{selectedReport.status}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{selectedReport.location.address}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Reported {formatTime(selectedReport.createdAt)}</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{selectedReport.description}</p>
            </div>

            {/* Status Timeline */}
            <div>
              <h3 className="font-semibold mb-3">Status Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <div>
                    <p className="font-medium">Report Submitted</p>
                    <p className="text-sm text-muted-foreground">{selectedReport.time}</p>
                  </div>
                </div>
                {selectedReport.status !== "pending" && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-accent rounded-full" />
                    <div>
                      <p className="font-medium">Under Review</p>
                      <p className="text-sm text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                )}
                {selectedReport.status === "resolved" && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    <div>
                      <p className="font-medium">Issue Resolved</p>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">My Reports</h1>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="p-4 space-y-3 bg-card border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "active", label: "Active" },
            { key: "resolved", label: "Resolved" },
          ].map((filter) => (
            <Button
              key={filter.key}
              variant={statusFilter === filter.key ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(filter.key)}
              className="whitespace-nowrap"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {filteredReports.length} Report{filteredReports.length !== 1 ? "s" : ""}
          </h2>
        </div>

        {filteredReports.map((report) => (
          <Card
            key={report.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedReport(report)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <img
                  src={report.images?.[0] || "/placeholder.svg"}
                  alt={report.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{report.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{report.location.address}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(report.createdAt)}</span>
                  </div>
                </div>
                <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredReports.length === 0 && (
          <div className="text-center py-8">
            <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No reports found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start by reporting your first civic issue"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
