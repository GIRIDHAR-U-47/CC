"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  MapPin,
  Clock,
  ChevronUp,
  MessageCircle,
  Share2,
  Send,
  User,
} from "lucide-react"

interface Comment {
  id: number
  author: string
  time: string
  text: string
}

interface Report {
  id: number
  title: string
  location: string
  coordinates: { lat: number; lng: number }
  time: string
  status: string
  image: string
  upvotes: number
  comments: number
  distance: string
  reportedBy: string
}

interface ReportDetailViewProps {
  report: Report
  comments: Comment[]
  onBack: () => void
  onUpvote: () => void
  isUpvoted: boolean
}

export function ReportDetailView({ report, comments, onBack, onUpvote, isUpvoted }: ReportDetailViewProps) {
  const [newComment, setNewComment] = useState("")
  const [localComments, setLocalComments] = useState(comments)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now(),
        author: "You",
        time: "Just now",
        text: newComment.trim()
      }
      setLocalComments([comment, ...localComments])
      setNewComment("")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 bg-card border-b border-border px-4 sm:px-6 py-4 z-50">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Button variant="ghost" size="icon" className="w-10 h-10" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">Issue Details</h1>
        </div>
      </header>

      <div className="pt-20 pb-24 px-4 sm:px-6 space-y-6 max-w-md mx-auto">
        {/* Report Details Card */}
        <Card>
          <CardContent className="p-0">
            <img
              src={report.image || "/placeholder.svg"}
              alt={report.title}
              className="w-full h-48 sm:h-56 object-cover rounded-t-lg"
            />
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg sm:text-xl font-bold leading-tight">{report.title}</h2>
                <Badge className={`${getStatusColor(report.status)} text-xs border ml-2 flex-shrink-0`}>
                  {report.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{report.location}</span>
                <span className="text-blue-600 font-medium ml-1">• {report.distance}</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                <Clock className="w-4 h-4" />
                <span>{report.time}</span>
                <span className="mx-1">•</span>
                <span>by {report.reportedBy}</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-10 px-4 gap-2 text-sm ${
                    isUpvoted 
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                      : 'text-muted-foreground hover:text-blue-600'
                  }`}
                  onClick={onUpvote}
                >
                  <ChevronUp className="w-4 h-4" />
                  <span>{report.upvotes}</span>
                  <span>Upvote</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 px-4 gap-2 text-sm text-muted-foreground hover:text-blue-600"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{localComments.length}</span>
                  <span>Comments</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 px-4 gap-2 text-sm text-muted-foreground hover:text-blue-600"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Comment Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Add Comment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts or similar experiences..."
                className="min-h-[80px] resize-none"
              />
              <Button 
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="w-full gap-2"
              >
                <Send className="w-4 h-4" />
                Post Comment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Comments ({localComments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {localComments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {localComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">{comment.time}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
