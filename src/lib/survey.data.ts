export const surveyData = {
  title: "Employee Satisfaction Survey",
  description: "",
  sections: [
    {
      id: "job_satisfaction",
      title: "Job Satisfaction",
      questions: [
        {
          id: "overall_job_satisfaction",
          type: "radio",
          question:
            "How would you describe your overall level of job satisfaction?",
          required: true,
          options: [
            "Very Satisfied",
            "Somewhat Satisfied",
            "Neutral",
            "Somewhat Disappointed",
            "Very Disappointed",
          ],
        },
        {
          id: "salary_rating",
          type: "radio",
          question: "How would you rate the following?\nSalary",
          required: true,
          options: ["Very Bad", "Bad", "Average", "Good", "Very Good"],
        },
        {
          id: "benefits_rating",
          type: "radio",
          question: "How would you rate the following?\nOverall Benefits",
          required: true,
          options: ["Very Bad", "Bad", "Average", "Good", "Very Good"],
        },
        {
          id: "health_benefits_rating",
          type: "radio",
          question: "How would you rate the following?\nHealth Benefits",
          required: true,
          options: ["Very Bad", "Bad", "Average", "Good", "Very Good"],
        },
        {
          id: "physical_environment_rating",
          type: "radio",
          question:
            "How would you rate the following?\nPhysical work environment",
          required: true,
          options: ["Very Bad", "Bad", "Average", "Good", "Very Good"],
        },
      ],
    },
    {
      id: "management",
      title: "Management & Leadership",
      questions: [
        {
          id: "senior_leadership_rating",
          type: "radio",
          question: "How would you rate the following?\nSenior Leadership",
          required: true,
          options: ["Very Bad", "Bad", "Average", "Good", "Very Good"],
        },
        {
          id: "individual_management_rating",
          type: "radio",
          question: "How would you rate the following?\nIndividual Management",
          required: true,
          options: ["Very Bad", "Bad", "Average", "Good", "Very Good"],
        },
        {
          id: "performance_feedback_rating",
          type: "radio",
          question: "How would you rate the following?\nPerformance Feedback",
          required: true,
          options: ["Very Bad", "Bad", "Average", "Good", "Very Good"],
        },
        {
          id: "employee_evaluation_rating",
          type: "radio",
          question: "How would you rate the following?\nEmployee Evaluations",
          required: true,
          options: ["Very Bad", "Bad", "Average", "Good", "Very Good"],
        },
        {
          id: "recognition_rating",
          type: "radio",
          question: "How would you rate the following?\nRecognitions",
          required: true,
          options: ["Very Bad", "Bad", "Average", "Good", "Very Good"],
        },
      ],
    },
    {
      id: "growth",
      title: "Growth & Appreciation",
      questions: [
        {
          id: "training_opportunities_rating",
          type: "radio",
          question: "How would you rate the following?\nTraining Opportunities",
          required: true,
          options: ["Very Bad", "Bad", "Average", "Good", "Very Good"],
        },
        {
          id: "advancement_opportunities_rating",
          type: "radio",
          question:
            "How would you rate the following?\nAdvancement Opportunities",
          required: true,
          options: ["Very Bad", "Bad", "Average", "Good", "Very Good"],
        },
        {
          id: "feel_appreciated",
          type: "radio",
          question: "Do you feel appreciated at work?",
          required: true,
          options: ["Yes", "No"],
        },
        {
          id: "feedback_effort",
          type: "radio",
          question:
            "Is enough effort made to solicit coworkers' opinions and feedback?",
          required: true,
          options: ["Always", "Often", "Sometimes", "Rarely", "Never"],
        },
        {
          id: "additional_feedback",
          type: "textarea",
          question: "Please provide additional feedback.",
          required: false,
          placeholder: "Write your feedback here...",
        },
      ],
    },
  ],
};
