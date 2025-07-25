"use client";
import { apiClient } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const loadData = async () => {
    const response = await apiClient.listFeedbacks();
    console.log(response.data);
    const feedbacks = await Promise.all(
      response.data.map(async (feedback) => {
        const message = await apiClient.getMessage(feedback.message_id);
        return { ...feedback, message: message.content };
      })
    );
    console.log(feedbacks);
    setFeedbacks(feedbacks);
  };
  useEffect(() => {
    loadData();
  }, []);
  return (
    <div className="flex flex-col gap-4 px-4 md:gap-6 md:py-6">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
        Feedback List
      </h1>
      <Separator />
      <div className="h-[calc(100vh-200px)] overflow-y-auto border rounded-md relative p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Message ID</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="w-1/2">Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks.map((feedback) => (
              <TableRow key={feedback.id}>
                <TableCell>{feedback.message_id}</TableCell>
                <TableCell className="whitespace-pre-wrap">
                  {feedback.comment}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={feedback.rating === 0 ? "default" : "outline"}
                  >
                    {feedback.rating === 1 ? "Like" : "Dislike"}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-pre-wrap">
                  {feedback.message}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
