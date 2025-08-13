import { getUser } from "@/action/user";

export default async function Todo() {
  const user = await getUser(); // Runs on server

  return (
    <div>
      <h1>To DO</h1>

      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
