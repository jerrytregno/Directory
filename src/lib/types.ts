export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
  devResetUrl?: string;
};

export const initialActionState: ActionState = {};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
};
