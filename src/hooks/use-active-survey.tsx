"use client"

import { useCallback, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

interface SurveyStatusResponse {
  message: string
  data: {
    isActive: boolean
    updatedAt: string
  }
  error?: string
}

export const useActiveSurvey = () => {
  const queryClient = useQueryClient()

  // Fetch survey status from server
  const { data, isLoading, isError, error } = useQuery<SurveyStatusResponse>({
    queryKey: ["survey-status"],
    queryFn: async () => {
      console.log("🔍 Fetching survey status...")

      // Call backend directly
      const response = await apiClient.get("/api/v1/surveystatus")
      console.log("📥 Backend response:", response.data)

      // Handle backend response structure
      // Backend returns: { message: "Success", data: [{ id: 1, status: "active" }] }
      if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
        console.error("❌ Invalid backend response:", response.data)
        throw new Error("Invalid backend response structure")
      }

      // Get first item from array
      const firstItem = response.data.data[0]
      if (!firstItem || !firstItem.status) {
        console.error("❌ No status in backend response:", firstItem)
        throw new Error("No status found in backend response")
      }

      // Convert backend status to boolean
      const isActive = firstItem.status === "active"

      // Return in expected format
      const result = {
        message: "Survey status retrieved successfully",
        data: {
          isActive,
          updatedAt: new Date().toISOString(),
        },
      }

      console.log("✅ Converted response:", result)
      return result
    },
    staleTime: 5000, // Cache for 5 seconds (shorter for more real-time updates)
    refetchInterval: 15000, // Auto-refetch every 15 seconds to keep status updated
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch on mount
    retry: 2, // Retry failed requests 2 times
  })

  // Get current status directly from query data
  // Handle both boolean and string types
  const rawStatus = data?.data?.isActive

  // Parse status with multiple type support
  let isActiveSurvey: boolean | undefined;

  if (rawStatus === undefined || rawStatus === null) {
    // If no data yet (loading), keep undefined
    isActiveSurvey = undefined
  } else if (typeof rawStatus === 'string') {
    // Handle string types: "true", "active" = true
    isActiveSurvey = rawStatus === 'true' || rawStatus === 'active'
  } else {
    // Handle boolean types
    isActiveSurvey = Boolean(rawStatus)
  }

  console.log("Survey status parsed:", {
    raw: rawStatus,
    parsed: isActiveSurvey,
    type: typeof rawStatus,
    hasData: !!data
  })

  // Log error if present
  if (isError && error) {
    console.error("Survey status query error:", error)
  }

  // Local state for optimistic UI updates during toggle
  const [optimisticStatus, setOptimisticStatus] = useState<boolean | null>(null)

  // Mutation to update survey status on server
  const updateStatusMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      console.log("🔄 Updating survey status to:", isActive)

      // Convert boolean to backend format
      const backendStatus = isActive ? "active" : "inactive"

      console.log("📤 Sending to backend:", {
        url: "/api/v1/surveystatus/1",
        method: "PUT",
        body: { status: backendStatus }
      })

      // Call backend directly (bypass our API route)
      const response = await apiClient.put("/api/v1/surveystatus/1", {
        status: backendStatus,
      })

      console.log("📥 Backend response:", response.data)
      return response.data
    },
    onSuccess: (response, isActive) => {
      console.log("✅ Survey status updated successfully:", { response, isActive })

      // Invalidate and refetch survey status (this will update the query cache)
      queryClient.invalidateQueries({ queryKey: ["survey-status"] })

      // Clear optimistic status after refetch completes
      setTimeout(() => {
        setOptimisticStatus(null)
      }, 100)

      // Show success notification
      toast.success(
        isActive
          ? "Survey activated successfully! All devices can now access the survey."
          : "Survey deactivated successfully! Survey access is now blocked on all devices.",
        {
          duration: 4000,
        }
      )
    },
    onError: (error) => {
      console.error("Failed to update survey status:", error)

      // Clear optimistic status on error (revert to server state)
      setOptimisticStatus(null)

      // Show error notification
      toast.error("Failed to update survey status. Please try again.", {
        duration: 4000,
      })
    },
  })

  const toggleSurvey = useCallback(() => {
    // Get current status - use actual isActiveSurvey or optimistic if set
    const currentStatus = optimisticStatus !== null ? optimisticStatus : (isActiveSurvey ?? false)
    const nextStatus = !currentStatus

    console.log("Toggling survey:", {
      currentStatus,
      nextStatus,
      optimisticStatus,
      isActiveSurvey,
    })

    // Set optimistic status immediately for UI
    setOptimisticStatus(nextStatus)

    // Update on server
    updateStatusMutation.mutate(nextStatus)
  }, [isActiveSurvey, optimisticStatus, updateStatusMutation])

  // Return optimistic status if available, otherwise use real status
  const displayStatus = optimisticStatus !== null ? optimisticStatus : isActiveSurvey

  return {
    isActiveSurvey: displayStatus,
    toggleSurvey,
    isLoading,
    isError,
    isUpdating: updateStatusMutation.isPending,
  }
}
