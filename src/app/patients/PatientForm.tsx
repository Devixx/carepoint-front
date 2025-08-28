// src/app/patients/PatientForm.tsx
"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../ui/primitives/Input";
import Button from "../ui/primitives/Button";

const schema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
});

export type PatientFormValues = z.infer<typeof schema>;

export default function PatientForm({
  onSubmit,
  defaultValues,
}: {
  onSubmit: (values: PatientFormValues) => void;
  defaultValues?: Partial<PatientFormValues>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="text-sm">First name</label>
        <Input {...register("firstName")} />
        {errors.firstName && (
          <p className="text-xs text-red-600">{errors.firstName.message}</p>
        )}
      </div>
      <div>
        <label className="text-sm">Last name</label>
        <Input {...register("lastName")} />
        {errors.lastName && (
          <p className="text-xs text-red-600">{errors.lastName.message}</p>
        )}
      </div>
      <div>
        <label className="text-sm">Email</label>
        <Input type="email" {...register("email")} />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label className="text-sm">Phone</label>
        <Input {...register("phone")} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>
          Save
        </Button>
      </div>
    </form>
  );
}
