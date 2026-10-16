"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth/requireOwner";
import { saveImage } from "@/lib/uploads";
import { firstError, ownerReplySchema, statusSchema, tagSchema } from "@/lib/validation";
import type { FormState } from "./auth";

export async function saveTag(_: FormState, formData: FormData): Promise<FormState> {
  const owner = await requireOwner();

  let design: unknown;
  try {
    design = JSON.parse(String(formData.get("design") ?? "{}"));
  } catch {
    return { error: "Invalid design" };
  }
  const parsed = tagSchema.safeParse({ itemName: formData.get("itemName") ?? "", note: formData.get("note") ?? "", design });
  if (!parsed.success) return { error: firstError(parsed.error) };

  let photoPath: string | null | undefined = undefined; // undefined = keep existing photo
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const saved = await saveImage(photo);
    if ("error" in saved) return { error: saved.error };
    photoPath = saved.name;
  } else if (formData.get("removePhoto") === "on") {
    photoPath = null;
  }

  const tagId = String(formData.get("tagId") ?? "");
  let id = tagId;
  if (tagId) {
    if (!owner.updateTag(tagId, { ...parsed.data, photoPath })) return { error: "Tag not found" };
  } else {
    id = owner.createTag({ ...parsed.data, photoPath: photoPath ?? null });
  }
  revalidatePath("/dashboard");
  redirect(`/tags/${id}`);
}

export async function changeStatus(formData: FormData) {
  const owner = await requireOwner();
  const status = statusSchema.safeParse(formData.get("status"));
  const tagId = String(formData.get("tagId"));
  if (status.success) owner.setStatus(tagId, status.data);
  revalidatePath(`/tags/${tagId}`);
}

export async function removeTag(formData: FormData) {
  const owner = await requireOwner();
  owner.deleteTag(String(formData.get("tagId")));
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function replyAsOwner(_: FormState, formData: FormData): Promise<FormState> {
  const owner = await requireOwner();
  const parsed = ownerReplySchema.safeParse({ conversationId: formData.get("conversationId"), body: formData.get("body") });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const tagId = owner.reply(parsed.data.conversationId, parsed.data.body);
  if (!tagId) return { error: "Conversation not found" };
  revalidatePath(`/tags/${tagId}`);
  return { ok: true };
}
