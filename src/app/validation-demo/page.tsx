"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFormValidation } from "@/hooks/use-form-validation"
import { employeeSchema, questionSchema, sectionSchema, loginSchema } from "@/lib/validation"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function ValidationDemoPage() {
  const [activeDemo, setActiveDemo] = useState<string>("employee")

  // Employee form demo
  const employeeInitialData = {
    name: "",
    email: "",
    position: "",
    division: "",
    status: "Active" as const,
  }

  const {
    data: employeeData,
    isSubmitting: employeeSubmitting,
    handleChange: employeeHandleChange,
    handleSubmit: employeeHandleSubmit,
    reset: employeeReset,
    getFieldError: employeeGetFieldError,
  } = useFormValidation({
    schema: employeeSchema,
    initialData: employeeInitialData,
  })

  // Question form demo
  const questionInitialData = {
    text: "",
    type: "multiple-choice" as const,
    options: [""],
  }

  const {
    data: questionData,
    isSubmitting: questionSubmitting,
    handleChange: questionHandleChange,
    handleSubmit: questionHandleSubmit,
    reset: questionReset,
    getFieldError: questionGetFieldError,
  } = useFormValidation({
    schema: questionSchema,
    initialData: questionInitialData,
  })

  // Section form demo
  const sectionInitialData = {
    title: "",
    description: "",
  }

  const {
    data: sectionData,
    isSubmitting: sectionSubmitting,
    handleChange: sectionHandleChange,
    handleSubmit: sectionHandleSubmit,
    reset: sectionReset,
    getFieldError: sectionGetFieldError,
  } = useFormValidation({
    schema: sectionSchema,
    initialData: sectionInitialData,
  })

  // Login form demo
  const loginInitialData = {
    email: "",
    password: "",
  }

  const {
    data: loginData,
    isSubmitting: loginSubmitting,
    handleChange: loginHandleChange,
    handleSubmit: loginHandleSubmit,
    reset: loginReset,
    getFieldError: loginGetFieldError,
  } = useFormValidation({
    schema: loginSchema,
    initialData: loginInitialData,
  })

  const handleEmployeeSubmit = async (data: any) => {
    console.log("Employee data:", data)
    alert("Employee form submitted successfully!")
    employeeReset()
  }

  const handleQuestionSubmit = async (data: any) => {
    console.log("Question data:", data)
    alert("Question form submitted successfully!")
    questionReset()
  }

  const handleSectionSubmit = async (data: any) => {
    console.log("Section data:", data)
    alert("Section form submitted successfully!")
    sectionReset()
  }

  const handleLoginSubmit = async (data: any) => {
    console.log("Login data:", data)
    alert("Login form submitted successfully!")
    loginReset()
  }

  const addQuestionOption = () => {
    const currentOptions = questionData.options || []
    questionHandleChange("options", [...currentOptions, ""])
  }

  const removeQuestionOption = (index: number) => {
    const currentOptions = questionData.options || []
    const newOptions = currentOptions.filter((_, i) => i !== index)
    questionHandleChange("options", newOptions)
  }

  const updateQuestionOption = (index: number, value: string) => {
    const currentOptions = questionData.options || []
    const newOptions = currentOptions.map((opt, i) => (i === index ? value : opt))
    questionHandleChange("options", newOptions)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Zod Validation Demo</h1>
          <p className="text-gray-600">Test all the form validation features implemented with Zod</p>
        </div>

        {/* Demo Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
            {[
              { id: "employee", label: "Employee Form" },
              { id: "question", label: "Question Form" },
              { id: "section", label: "Section Form" },
              { id: "login", label: "Login Form" },
            ].map((demo) => (
              <Button
                key={demo.id}
                variant={activeDemo === demo.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveDemo(demo.id)}
              >
                {demo.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Employee Form Demo */}
        {activeDemo === "employee" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Employee Form Validation
              </CardTitle>
              <p className="text-sm text-gray-600">
                Test employee form with comprehensive validation rules
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                employeeHandleSubmit(handleEmployeeSubmit)
              }}>
                <div className="grid gap-4">
                  <FormField
                    label="Full Name"
                    error={employeeGetFieldError("name")}
                    required
                  >
                    <Input
                      value={employeeData.name}
                      onChange={(e) => employeeHandleChange("name", e.target.value)}
                      placeholder="Enter full name (letters only)"
                      className={employeeGetFieldError("name") ? "border-destructive" : ""}
                    />
                  </FormField>

                  <FormField
                    label="Email"
                    error={employeeGetFieldError("email")}
                    required
                  >
                    <Input
                      type="email"
                      value={employeeData.email}
                      onChange={(e) => employeeHandleChange("email", e.target.value)}
                      placeholder="Enter valid email address"
                      className={employeeGetFieldError("email") ? "border-destructive" : ""}
                    />
                  </FormField>

                  <FormField
                    label="Position"
                    error={employeeGetFieldError("position")}
                    required
                  >
                    <Input
                      value={employeeData.position}
                      onChange={(e) => employeeHandleChange("position", e.target.value)}
                      placeholder="Enter position"
                      className={employeeGetFieldError("position") ? "border-destructive" : ""}
                    />
                  </FormField>

                  <FormField
                    label="Division"
                    error={employeeGetFieldError("division")}
                    required
                  >
                    <Select
                      value={employeeData.division}
                      onValueChange={(value) => employeeHandleChange("division", value)}
                    >
                      <SelectTrigger className={employeeGetFieldError("division") ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField
                    label="Status"
                    error={employeeGetFieldError("status")}
                  >
                    <Select
                      value={employeeData.status}
                      onValueChange={(value: "Active" | "Inactive") => employeeHandleChange("status", value)}
                    >
                      <SelectTrigger className={employeeGetFieldError("status") ? "border-destructive" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <Button type="submit" disabled={employeeSubmitting} className="w-full">
                    {employeeSubmitting ? "Submitting..." : "Submit Employee Form"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Question Form Demo */}
        {activeDemo === "question" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Question Form Validation
              </CardTitle>
              <p className="text-sm text-gray-600">
                Test question form with dynamic options validation
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                questionHandleSubmit(handleQuestionSubmit)
              }}>
                <div className="grid gap-4">
                  <FormField
                    label="Question Text"
                    error={questionGetFieldError("text")}
                    required
                  >
                    <Textarea
                      value={questionData.text}
                      onChange={(e) => questionHandleChange("text", e.target.value)}
                      placeholder="Enter your question (5-200 characters)"
                      className={questionGetFieldError("text") ? "border-destructive" : ""}
                    />
                  </FormField>

                  <FormField
                    label="Question Type"
                    error={questionGetFieldError("type")}
                  >
                    <Select
                      value={questionData.type}
                      onValueChange={(value: "multiple-choice" | "text" | "rating") => {
                        questionHandleChange("type", value)
                        if (value === "multiple-choice") {
                          questionHandleChange("options", [""])
                        } else {
                          questionHandleChange("options", undefined)
                        }
                      }}
                    >
                      <SelectTrigger className={questionGetFieldError("type") ? "border-destructive" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                        <SelectItem value="text">Text Response</SelectItem>
                        <SelectItem value="rating">Rating Scale</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  {questionData.type === "multiple-choice" && (
                    <FormField
                      label="Options"
                      error={questionGetFieldError("options")}
                    >
                      <div className="space-y-2">
                        {questionData.options?.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateQuestionOption(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className={questionGetFieldError("options") ? "border-destructive" : ""}
                            />
                            {questionData.options && questionData.options.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeQuestionOption(index)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addQuestionOption}>
                          Add Option
                        </Button>
                      </div>
                    </FormField>
                  )}

                  <Button type="submit" disabled={questionSubmitting} className="w-full">
                    {questionSubmitting ? "Submitting..." : "Submit Question Form"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Section Form Demo */}
        {activeDemo === "section" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                Section Form Validation
              </CardTitle>
              <p className="text-sm text-gray-600">
                Test section form with title and description validation
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                sectionHandleSubmit(handleSectionSubmit)
              }}>
                <div className="grid gap-4">
                  <FormField
                    label="Section Title"
                    error={sectionGetFieldError("title")}
                    required
                  >
                    <Input
                      value={sectionData.title}
                      onChange={(e) => sectionHandleChange("title", e.target.value)}
                      placeholder="Enter section title (3-100 characters)"
                      className={sectionGetFieldError("title") ? "border-destructive" : ""}
                    />
                  </FormField>

                  <FormField
                    label="Description"
                    error={sectionGetFieldError("description")}
                  >
                    <Textarea
                      value={sectionData.description}
                      onChange={(e) => sectionHandleChange("description", e.target.value)}
                      placeholder="Enter description (optional, max 500 characters)"
                      className={sectionGetFieldError("description") ? "border-destructive" : ""}
                    />
                  </FormField>

                  <Button type="submit" disabled={sectionSubmitting} className="w-full">
                    {sectionSubmitting ? "Submitting..." : "Submit Section Form"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Login Form Demo */}
        {activeDemo === "login" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-600" />
                Login Form Validation
              </CardTitle>
              <p className="text-sm text-gray-600">
                Test login form with email and password validation
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                loginHandleSubmit(handleLoginSubmit)
              }}>
                <div className="grid gap-4">
                  <FormField
                    label="Email"
                    error={loginGetFieldError("email")}
                    required
                  >
                    <Input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => loginHandleChange("email", e.target.value)}
                      placeholder="Enter valid email address"
                      className={loginGetFieldError("email") ? "border-destructive" : ""}
                    />
                  </FormField>

                  <FormField
                    label="Password"
                    error={loginGetFieldError("password")}
                    required
                  >
                    <Input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => loginHandleChange("password", e.target.value)}
                      placeholder="Enter password (min 6 characters)"
                      className={loginGetFieldError("password") ? "border-destructive" : ""}
                    />
                  </FormField>

                  <Button type="submit" disabled={loginSubmitting} className="w-full">
                    {loginSubmitting ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Validation Features Info */}
        <Card className="max-w-4xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Zod Validation Features Implemented
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Employee Form Validation</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Name: 2-50 characters, letters and spaces only</li>
                  <li>• Email: Valid email format required</li>
                  <li>• Position: 2-50 characters</li>
                  <li>• Division: Required selection</li>
                  <li>• Status: Active/Inactive enum</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Question Form Validation</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Text: 5-200 characters</li>
                  <li>• Type: Multiple choice, text, or rating</li>
                  <li>• Options: Required for multiple choice, non-empty</li>
                  <li>• Dynamic validation based on question type</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Section Form Validation</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Title: 3-100 characters</li>
                  <li>• Description: Optional, max 500 characters</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Login Form Validation</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Email: Valid email format required</li>
                  <li>• Password: Minimum 6 characters</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 