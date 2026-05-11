"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "../lib/http";
import { StarIcon } from "lucide-react";
import { Flag, ChevronDown, ChevronUp } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  patientId: string;
  appointmentId?: string;
  isHidden: boolean;
  reportReason?: string;
  reportedAt?: string;
  createdAt: string;
  patient?: { firstName: string; lastName: string };
}

function useMyReviews() {
  return useQuery({
    queryKey: ["my-reviews"],
    queryFn: async () => {
      const res = await http.get<Review[]>("/reviews/mine");
      return res.data;
    },
  });
}

function useReportReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await http.patch(`/reviews/${id}/report`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
    },
  });
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <StarIcon
          key={s}
          className={`h-4 w-4 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  );
}

function ReportModal({
  reviewId,
  onClose,
}: {
  reviewId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const report = useReportReview();

  const handleSubmit = async () => {
    if (reason.trim().length < 10) return;
    await report.mutateAsync({ id: reviewId, reason: reason.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Report Review</h3>
        <p className="text-sm text-gray-500 mb-4">
          Tell us why this review is inappropriate. We'll review your report.
        </p>
        <textarea
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1"
          rows={4}
          placeholder="Describe why this review violates guidelines (min 10 characters)..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
        />
        <p className="text-xs text-gray-400 text-right mb-4">{reason.length}/500</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={reason.trim().length < 10 || report.isPending}
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl text-sm font-medium text-white transition-colors"
          >
            {report.isPending ? "Reporting…" : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const [reporting, setReporting] = useState(false);

  const patientName = review.patient
    ? `${review.patient.firstName} ${review.patient.lastName[0]}.`
    : "Anonymous patient";

  const alreadyReported = !!review.reportedAt;

  return (
    <>
      {reporting && <ReportModal reviewId={review.id} onClose={() => setReporting(false)} />}
      <div className={`border rounded-xl p-5 transition-colors ${alreadyReported ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-white hover:border-blue-200"}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {review.patient?.firstName?.[0] ?? "P"}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{patientName}</p>
              <p className="text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <StarRow rating={review.rating} />
            <span className="text-sm font-bold text-gray-700">{review.rating}/5</span>
          </div>
        </div>

        {review.comment && (
          <div className="mt-3 ml-12">
            <p className={`text-sm text-gray-700 leading-relaxed ${!expanded && review.comment.length > 200 ? "line-clamp-3" : ""}`}>
              {review.comment}
            </p>
            {review.comment.length > 200 && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {expanded ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> Read more</>}
              </button>
            )}
          </div>
        )}

        <div className="mt-3 ml-12 flex items-center gap-3">
          {alreadyReported ? (
            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-full font-medium">
              Reported · Under review
            </span>
          ) : (
            <button
              onClick={() => setReporting(true)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600 transition-colors font-medium"
            >
              <Flag className="h-3.5 w-3.5" />
              Report
            </button>
          )}
          {review.isHidden && (
            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full font-medium">
              Hidden
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default function ReviewsPage() {
  const { data: reviews = [], isLoading } = useMyReviews();

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100) : 0,
  }));

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Reviews</h1>
        <p className="text-gray-500 text-sm mt-1">Reviews from your completed appointments</p>
      </div>

      {/* Summary card */}
      {reviews.length > 0 && avgRating && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex gap-8 items-center shadow-sm">
          <div className="text-center flex-shrink-0">
            <p className="text-5xl font-extrabold text-gray-900">{avgRating}</p>
            <StarRow rating={Math.round(Number(avgRating))} />
            <p className="text-xs text-gray-500 mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 space-y-2">
            {distribution.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-right text-gray-500">{star}</span>
                <StarIcon className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-gray-500 text-xs">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <StarIcon className="h-12 w-12 mx-auto mb-3 text-gray-200 fill-gray-200" />
          <p className="font-medium text-gray-600">No reviews yet</p>
          <p className="text-sm mt-1">Reviews appear here after patients complete appointments with you.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
