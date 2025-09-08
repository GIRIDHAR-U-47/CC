"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bell, CheckCircle, Clock, AlertTriangle, Trash2 } from "lucide-react"

interface NotificationsPageProps {
  onBack: () => void
}

const mockNotifications = [
  {
    id: 1,
    title: "Report Status Update",
    message: "Your report 'Broken Street Light' has been marked as resolved.",
    time: "2 hours ago",
    type: "success",
    read: false,
    reportId: 1,
  },
  {
    id: 2,
    title: "New Report Acknowledged",
    message: "Your report 'Pothole on Highway' is now under review by the city department.",
    time: "1 day ago",
    type: "info",
    read: false,
    reportId: 2,
  },
  {
    id: 3,
    title: "Report Needs More Information",
    message: "Additional details requested for your 'Graffiti on Building' report.",
    time: "2 days ago",
    type: "warning",
    read: true,
    reportId: 3,
  },
  {
    id: 4,
    title: "Welcome to Civic Reporter",
    message: "Thank you for joining! Start making a difference in your community.",
    time: "1 week ago",
    type: "info",
    read: true,
    reportId: null,
  },
  {
    id: 5,
    title: "Report Submitted Successfully",
    message: "Your report 'Overflowing Trash Can' has been submitted and assigned ID #12345.",
    time: "1 week ago",
    type: "success",
    read: true,
    reportId: 4,
  },
]

export function NotificationsPage({ onBack }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-primary" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "info":
      default:
        return <Bell className="w-5 h-5 text-accent" />
    }
  }

  const getNotificationBorder = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-primary"
      case "warning":
        return "border-l-yellow-500"
      case "info":
      default:
        return "border-l-accent"
    }
  }

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const filteredNotifications = filter === "unread" ? notifications.filter((n) => !n.read) : notifications
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Notifications</h1>
              {unreadCount > 0 && <p className="text-sm text-muted-foreground">{unreadCount} unread</p>}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="px-4 py-3 bg-card border-b border-border">
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All ({notifications.length})
          </Button>
          <Button variant={filter === "unread" ? "default" : "outline"} size="sm" onClick={() => setFilter("unread")}>
            Unread ({unreadCount})
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No notifications</h3>
            <p className="text-muted-foreground">
              {filter === "unread" ? "All caught up! No unread notifications." : "You'll see notifications here."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all border-l-4 ${getNotificationBorder(notification.type)} ${
                !notification.read ? "bg-accent/5" : ""
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3
                          className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{notification.time}</span>
                          </div>
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
