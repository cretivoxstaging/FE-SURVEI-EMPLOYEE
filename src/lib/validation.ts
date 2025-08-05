import { z } from "zod";

// Employee validation schema
export const employeeSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  position: z
    .string()
    .min(2, "Position must be at least 2 characters")
    .max(50, "Position must be less than 50 characters"),
  division: z.string().min(1, "Division is required"),
  status: z.enum(["Active", "Inactive"]),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

// Question validation schema
export const questionSchema = z.object({
  text: z
    .string()
    .min(5, "Question text must be at least 5 characters")
    .max(200, "Question text must be less than 200 characters"),
  type: z.enum(["multiple-choice", "text", "rating"]),
  options: z.array(z.string().min(1, "Option cannot be empty")).optional(),
});

export type QuestionFormData = z.infer<typeof questionSchema>;

// Section validation schema
export const sectionSchema = z.object({
  title: z
    .string()
    .min(3, "Section title must be at least 3 characters")
    .max(100, "Section title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

export type SectionFormData = z.infer<typeof sectionSchema>;

// Survey response validation schema
export const surveyResponseSchema = z.object({
  responses: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

export type SurveyResponseData = z.infer<typeof surveyResponseSchema>;

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
