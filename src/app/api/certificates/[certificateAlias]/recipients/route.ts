import { NextApiRequest, NextApiResponse } from "next";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { certificateAlias } = req.query;

  if (req.method === "GET") {
    try {
      const supabase = createRouteHandlerClient({ cookies });
      const { data: recipients, error } = await supabase
        .from("certificateRecipients")
        .select("*")
        .eq("certificateAlias", String(certificateAlias));

      if (error) {
        throw error;
      }

      res.status(200).json(recipients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recipients" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
