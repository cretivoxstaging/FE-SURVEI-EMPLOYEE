import { useState } from "react";
import { z, ZodSchema } from "zod";

interface UseFormValidationProps<T> {
  schema: ZodSchema<T>;
  initialData: T;
}

interface ValidationError {
  [key: string]: string;
}

export function useFormValidation<T>({
  schema,
  initialData,
}: UseFormValidationProps<T>) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationError = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleChange = (field: keyof T, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (onSubmit: (data: T) => void | Promise<void>) => {
    setIsSubmitting(true);

    if (validate()) {
      try {
        await onSubmit(data);
      } catch (error) {
        console.error("Form submission error:", error);
      }
    }

    setIsSubmitting(false);
  };

  const reset = () => {
    setData(initialData);
    setErrors({});
    setIsSubmitting(false);
  };

  const getFieldError = (field: keyof T): string => {
    return errors[field as string] || "";
  };

  const hasErrors = (): boolean => {
    return Object.keys(errors).length > 0;
  };

  return {
    data,
    errors,
    isSubmitting,
    validate,
    handleChange,
    handleSubmit,
    reset,
    getFieldError,
    hasErrors,
  };
}
