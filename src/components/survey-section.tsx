"use client"

import { useSection } from "@/hooks/use-sections"

export default function SurveySection({
  sectionId,
  initialAnswers,
  onAnswerChange,
}: {
  sectionId: string
  initialAnswers: Record<string, string | string[]>
  onAnswerChange: (sectionId: string, answers: Record<string, string | string[]>) => void
}) {
  const { sections, isLoading, isError, error } = useSection()
  const section = sections?.find((s: any) => String(s.id) === String(sectionId))

  if (isLoading) return <p>Loading section...</p>
  if (isError) return <p>Error: {String(error)}</p>
  if (!section) return <p>Section not found</p>

  const handleChange = (qId: string, value: string | string[]) => {
    onAnswerChange(sectionId, {
      ...initialAnswers,
      [qId]: value,
    })
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{section.title}</h2>

      {section.questions?.map((q: any) => (
        <div key={q.id} className="mb-6">
          <p className="font-medium mb-2">{q.question}</p>

          {q.type === "text" && (
            <input
              type="text"
              value={initialAnswers[q.id] as string || ""}
              onChange={(e) => handleChange(q.id, e.target.value)}
              className="border p-2 w-full rounded"
            />
          )}

          {q.type === "option" &&
            q.options &&
            Object.entries(q.options).map(([key, label]) => (
              <label key={key} className="block">
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={label as string}
                  checked={initialAnswers[q.id] === label}
                  onChange={() => handleChange(q.id, label as string)}
                />{" "}
                {label}
              </label>
            ))}

          {q.type === "rating" &&
            [1, 2, 3, 4, 5].map((num) => (
              <label key={num} className="mr-4">
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={String(num)}
                  checked={initialAnswers[q.id] === String(num)}
                  onChange={() => handleChange(q.id, String(num))}
                />{" "}
                {num}
              </label>
            ))}
        </div>
      ))}
    </div>
  )
}
