import { checkRole } from "~/utils/roles";
import { redirect } from "next/navigation";
import { getFeedback } from "../_components/getFeedback";
import FeedbackTable from "../_components/feedbackTable";

export default async function Feedback() {
  // Protect the page from users who are not admins
  const isAdmin = await checkRole("admin");
  if (!isAdmin) {
    redirect("/");
  }

  const feedback = await getFeedback();

  return (
    <>
      <h1 className="text-center text-2xl font-bold">Feedback</h1>
      <FeedbackTable feedback={feedback} />
    </>
  );
}
