import { uploadMediaAction } from "@/utils/helpers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();

  const file = formData.get("file") as File;
  const organizationAlias = formData.get("organizationAlias") as string;
  const userId = formData.get("userId") as string;
  const filename = formData.get("filename") as string || file.name;

  console.log({organizationAlias,userId,filename})

  if (!file || !organizationAlias || !userId) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Size/type check
  // Quota check

  try {
    const {data,error} =  await uploadMediaAction(
        file, organizationAlias, userId, filename, 
    )
    return NextResponse.json({ data, error });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
}
