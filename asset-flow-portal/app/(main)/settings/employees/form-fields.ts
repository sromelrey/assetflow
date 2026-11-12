import { FormField } from "@/components/entity-manager";

export const getFormFields = (): FormField[] => [
  {
    name: "firstName",
    label: "First Name",
    type: "text",
    placeholder: "John",
    required: true,
  },
  {
    name: "lastName",
    label: "Last Name",
    type: "text",
    placeholder: "Doe",
    required: true,
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "john.doe@example.com",
    required: false,
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "text",
    placeholder: "+1 234 567 890",
    required: false,
  },
  {
    name: "position",
    label: "Job Position",
    type: "text",
    placeholder: "Software Engineer",
    required: false,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
    defaultValue: "active",
    required: true,
  },
];
