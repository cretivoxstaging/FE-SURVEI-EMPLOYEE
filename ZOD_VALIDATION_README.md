# Zod Validation Implementation

This document describes the comprehensive Zod validation implementation for the Annual Survey application.

## Overview

Zod validation has been implemented across all forms in the application to provide:

- Type-safe form validation
- Real-time error feedback
- Consistent validation rules
- Better user experience

## Files Created/Modified

### New Files

- `src/lib/validation.ts` - Zod validation schemas
- `src/hooks/use-form-validation.ts` - Custom hook for form validation
- `src/components/ui/form-field.tsx` - Reusable form field component
- `src/app/validation-demo/page.tsx` - Demo page showcasing all validation features

### Modified Files

- `src/components/add-employee-modal.tsx` - Updated with Zod validation
- `src/components/edit-employee-modal.tsx` - Updated with Zod validation
- `src/components/add-question-modal.tsx` - Updated with Zod validation
- `src/app/auth/login/page.tsx` - Updated with Zod validation

## Validation Schemas

### Employee Schema

```typescript
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
```

**Validation Rules:**

- Name: 2-50 characters, letters and spaces only
- Email: Valid email format required
- Position: 2-50 characters
- Division: Required selection
- Status: Active/Inactive enum

### Question Schema

```typescript
export const questionSchema = z.object({
  text: z
    .string()
    .min(5, "Question text must be at least 5 characters")
    .max(200, "Question text must be less than 200 characters"),
  type: z.enum(["multiple-choice", "text", "rating"]),
  options: z.array(z.string().min(1, "Option cannot be empty")).optional(),
});
```

**Validation Rules:**

- Text: 5-200 characters
- Type: Multiple choice, text, or rating
- Options: Required for multiple choice, non-empty
- Dynamic validation based on question type

### Section Schema

```typescript
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
```

**Validation Rules:**

- Title: 3-100 characters
- Description: Optional, max 500 characters

### Login Schema

```typescript
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
```

**Validation Rules:**

- Email: Valid email format required
- Password: Minimum 6 characters

## Custom Hook: useFormValidation

The `useFormValidation` hook provides a consistent interface for form validation:

```typescript
const {
  data,           // Current form data
  errors,         // Validation errors object
  isSubmitting,   // Loading state
  validate,       // Manual validation function
  handleChange,   // Update form field
  handleSubmit,   // Submit form with validation
  reset,          // Reset form to initial state
  getFieldError,  // Get error for specific field
  hasErrors,      // Check if form has any errors
} = useFormValidation({
  schema: employeeSchema,
  initialData: { name: "", email: "", ... },
})
```

## FormField Component

A reusable component that displays labels, validation errors, and form controls:

```typescript
<FormField label='Full Name' error={getFieldError("name")} required>
  <Input
    value={data.name}
    onChange={(e) => handleChange("name", e.target.value)}
    className={getFieldError("name") ? "border-destructive" : ""}
  />
</FormField>
```

## Features

### Real-time Validation

- Errors are displayed as users type
- Error messages clear when users start typing
- Visual feedback with red borders on invalid fields

### Type Safety

- Full TypeScript support
- Compile-time validation of form data
- Type inference from Zod schemas

### User Experience

- Clear error messages
- Loading states during submission
- Form reset functionality
- Consistent styling across all forms

### Accessibility

- Proper ARIA labels
- Error announcements for screen readers
- Keyboard navigation support

## Demo Page

Visit `/validation-demo` to test all validation features:

- Employee form with comprehensive validation
- Question form with dynamic options
- Section form with title/description validation
- Login form with email/password validation

## Usage Examples

### Basic Form Implementation

```typescript
const { data, handleChange, handleSubmit, getFieldError } = useFormValidation({
  schema: employeeSchema,
  initialData: { name: "", email: "", ... },
})

const onSubmit = async (data: EmployeeFormData) => {
  // Handle form submission
  console.log("Valid data:", data)
}

<form onSubmit={(e) => {
  e.preventDefault()
  handleSubmit(onSubmit)
}}>
  <FormField label="Name" error={getFieldError("name")} required>
    <Input
      value={data.name}
      onChange={(e) => handleChange("name", e.target.value)}
    />
  </FormField>
</form>
```

### Dynamic Validation

```typescript
// Question type changes affect validation
onValueChange={(value) => {
  handleChange("type", value)
  if (value === "multiple-choice") {
    handleChange("options", [""])
  } else {
    handleChange("options", undefined)
  }
}}
```

## Benefits

1. **Type Safety**: Compile-time validation prevents runtime errors
2. **Consistency**: All forms use the same validation patterns
3. **Maintainability**: Centralized validation rules
4. **User Experience**: Clear feedback and error handling
5. **Developer Experience**: Easy to add new validation rules
6. **Accessibility**: Proper error announcements and labels

## Future Enhancements

- Add custom validation rules for specific business logic
- Implement async validation for server-side checks
- Add validation for file uploads
- Create more complex conditional validation rules
- Add validation for survey responses

## Dependencies

- `zod`: Schema validation library
- `@/components/ui/*`: UI components
- `@/lib/utils`: Utility functions

The implementation provides a robust, type-safe, and user-friendly form validation system that can be easily extended for future requirements.
