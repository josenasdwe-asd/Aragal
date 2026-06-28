import { getCollaborations } from "@/lib/data";
import { CollaborationsClient } from "./collaborations-client";

export async function Collaborations() {
  const items = await getCollaborations();
  return <CollaborationsClient items={items} />;
}
