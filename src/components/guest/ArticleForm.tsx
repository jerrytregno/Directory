"use client";

import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { useActionState, useRef, useState } from "react";
import { ArticleContent } from "@/components/guest/ArticleContent";
import { Notice } from "@/components/Notice";
import { uploadGuestAsset } from "@/lib/actions/guest-posts";
import { GUEST_TOPICS, prepareArticle, wordCount, type GuestPost } from "@/lib/guest-content";
import { buttonClass, buttonSecondaryClass, inputClass } from "@/lib/styles";
import { initialActionState, type ActionState } from "@/lib/types";

type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

function ToolButton({ editor, active, label, onClick }: { editor: Editor | null; active?: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={!editor}
      onClick={onClick}
      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${active ? "bg-ink text-white" : "bg-white text-ink hover:bg-sand"} disabled:opacity-50`}
    >
      {label}
    </button>
  );
}

export function ArticleForm({
  mode,
  action,
  post,
  authorName = "",
  authorEmail = "",
}: {
  mode: "author" | "admin";
  action: FormAction;
  post?: GuestPost | null;
  authorName?: string;
  authorEmail?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [words, setWords] = useState(() => wordCount(post?.content || ""));
  const [uploading, setUploading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewDescription, setPreviewDescription] = useState("");
  const contentRef = useRef<HTMLInputElement>(null);
  const intentRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      LinkExtension.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      ImageExtension,
      Placeholder.configure({ placeholder: "Write the article…" }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: post?.content || "",
    onUpdate: ({ editor: current }) => {
      const html = current.getHTML();
      setWords(wordCount(html));
      if (contentRef.current) contentRef.current.value = html;
    },
    editorProps: {
      attributes: {
        class: "tiptap article-body min-h-80 px-4 py-4 focus:outline-none",
      },
    },
  });

  function askLink() {
    if (!editor) return;
    const previous = String(editor.getAttributes("link").href || "");
    const url = window.prompt("Link URL", previous || "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  async function onImage(file: File | undefined) {
    if (!editor || !file) return;
    const body = new FormData();
    body.set("file", file);
    setUploading(true);
    const result = await uploadGuestAsset(body);
    setUploading(false);
    if (result.error || !result.url) {
      window.alert(result.error || "Upload failed.");
      return;
    }
    const alt = window.prompt("Describe this image for screen readers", "") || "Article image";
    editor.chain().focus().setImage({ src: result.url, alt }).run();
  }

  function openPreview() {
    const html = editor?.getHTML() || contentRef.current?.value || "";
    const data = formRef.current ? new FormData(formRef.current) : new FormData();
    setPreviewTitle(String(data.get("title") || "Untitled article"));
    setPreviewDescription(String(data.get("shortDescription") || ""));
    setPreviewHtml(html);
  }

  const article = previewHtml !== null ? prepareArticle(previewHtml) : null;
  const error = (name: string) => state.fieldErrors?.[name];

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-6"
      onSubmit={() => {
        if (contentRef.current) contentRef.current.value = editor?.getHTML() || "";
      }}
    >
      <input ref={contentRef} type="hidden" name="content" defaultValue={post?.content || ""} />
      <input ref={intentRef} type="hidden" name="intent" defaultValue="draft" />
      {post ? <input type="hidden" name="postId" value={post.id} /> : null}
      <input type="hidden" name="existingFeaturedImage" value={post?.featuredImage || ""} />
      <input type="hidden" name="existingAuthorImage" value={post?.authorImage || ""} />

      {state.error ? <Notice tone="error">{state.error}</Notice> : null}

      <div className={article ? "hidden" : "space-y-6"}>
        <label className="block text-sm font-semibold">
          Article title
          <input className={`${inputClass} mt-2`} name="title" defaultValue={post?.title || ""} maxLength={140} />
          {error("title") ? <span className="mt-1 block font-medium text-rose">{error("title")}</span> : null}
        </label>
        <label className="block text-sm font-semibold">
          Short description
          <textarea className={`${inputClass} mt-2 min-h-24`} name="shortDescription" defaultValue={post?.shortDescription || ""} maxLength={300} />
          {error("shortDescription") ? <span className="mt-1 block font-medium text-rose">{error("shortDescription")}</span> : null}
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold">
            Category
            <select className={`${inputClass} mt-2`} name="category" defaultValue={post?.category || ""}>
              <option value="">Choose a topic</option>
              {GUEST_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
            {error("category") ? <span className="mt-1 block font-medium text-rose">{error("category")}</span> : null}
          </label>
          <label className="block text-sm font-semibold">
            Tags / keywords
            <input className={`${inputClass} mt-2`} name="tags" defaultValue={post?.tags.join(", ") || ""} placeholder="ai, seo, startups" />
            {error("tags") ? <span className="mt-1 block font-medium text-rose">{error("tags")}</span> : null}
          </label>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold">Article content</p>
            <p className="text-xs text-muted">{words} words · 800+ recommended</p>
          </div>
          <div className="mt-2 overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex flex-wrap gap-1 border-b border-line bg-sand/70 p-2">
              <ToolButton editor={editor} label="H1" active={editor?.isActive("heading", { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} />
              <ToolButton editor={editor} label="H2" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} />
              <ToolButton editor={editor} label="H3" active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} />
              <ToolButton editor={editor} label="Bold" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} />
              <ToolButton editor={editor} label="Italic" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} />
              <ToolButton editor={editor} label="Bullets" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
              <ToolButton editor={editor} label="Numbers" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
              <ToolButton editor={editor} label="Link" active={editor?.isActive("link")} onClick={askLink} />
              <ToolButton editor={editor} label={uploading ? "Uploading…" : "Image"} onClick={() => imageRef.current?.click()} />
              <ToolButton editor={editor} label="Quote" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
              <ToolButton editor={editor} label="Table" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
              <ToolButton editor={editor} label="Code" active={editor?.isActive("codeBlock")} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} />
            </div>
            <input
              ref={imageRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                void onImage(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <EditorContent editor={editor} />
          </div>
          {error("content") ? <p className="mt-1 text-sm font-medium text-rose">{error("content")}</p> : null}
        </div>

        <label className="block text-sm font-semibold">
          Featured image
          {post?.featuredImage ? <img src={post.featuredImage} alt="" className="mt-2 h-36 w-full rounded-xl object-cover" /> : null}
          <input className={`${inputClass} mt-2`} type="file" name="featuredImage" accept="image/png,image/jpeg,image/webp,image/gif" />
          {error("featuredImage") ? <span className="mt-1 block font-medium text-rose">{error("featuredImage")}</span> : null}
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold">
            Author name
            <input className={`${inputClass} mt-2`} name="authorName" defaultValue={post?.authorName || authorName} maxLength={80} />
            {error("authorName") ? <span className="mt-1 block font-medium text-rose">{error("authorName")}</span> : null}
          </label>
          <label className="block text-sm font-semibold">
            Author email
            <input className={`${inputClass} mt-2`} type="email" name="authorEmail" defaultValue={post?.authorEmail || authorEmail} maxLength={160} />
            {error("authorEmail") ? <span className="mt-1 block font-medium text-rose">{error("authorEmail")}</span> : null}
          </label>
        </div>
        <label className="block text-sm font-semibold">
          Author bio
          <textarea className={`${inputClass} mt-2 min-h-28`} name="authorBio" defaultValue={post?.authorBio || ""} maxLength={600} />
          {error("authorBio") ? <span className="mt-1 block font-medium text-rose">{error("authorBio")}</span> : null}
        </label>
        <label className="block text-sm font-semibold">
          Author profile image
          {post?.authorImage ? <img src={post.authorImage} alt="" className="mt-2 h-16 w-16 rounded-full object-cover" /> : null}
          <input className={`${inputClass} mt-2`} type="file" name="authorImage" accept="image/png,image/jpeg,image/webp,image/gif" />
          {error("authorImage") ? <span className="mt-1 block font-medium text-rose">{error("authorImage")}</span> : null}
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm font-semibold">
            Author website
            <input className={`${inputClass} mt-2`} type="url" name="authorWebsite" defaultValue={post?.authorWebsite || ""} placeholder="https://" />
            {error("authorWebsite") ? <span className="mt-1 block font-medium text-rose">{error("authorWebsite")}</span> : null}
          </label>
          <label className="block text-sm font-semibold">
            LinkedIn profile
            <input className={`${inputClass} mt-2`} type="url" name="linkedinUrl" defaultValue={post?.linkedinUrl || ""} placeholder="https://" />
            {error("linkedinUrl") ? <span className="mt-1 block font-medium text-rose">{error("linkedinUrl")}</span> : null}
          </label>
          <label className="block text-sm font-semibold">
            Twitter / X profile
            <input className={`${inputClass} mt-2`} type="url" name="twitterUrl" defaultValue={post?.twitterUrl || ""} placeholder="https://" />
            {error("twitterUrl") ? <span className="mt-1 block font-medium text-rose">{error("twitterUrl")}</span> : null}
          </label>
        </div>
      </div>

      {article ? (
        <div className="rounded-3xl border border-line bg-white px-6 py-8 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pine">Preview</p>
          <h2 className="mt-3 text-4xl font-extrabold leading-tight">{previewTitle}</h2>
          {previewDescription ? <p className="mt-4 text-lg leading-7 text-muted">{previewDescription}</p> : null}
          <div className="mt-8">
            <ArticleContent html={article.html} />
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonSecondaryClass} onClick={() => (article ? setPreviewHtml(null) : openPreview())}>
          {article ? "Back to editor" : "Preview"}
        </button>
        {mode === "author" ? (
          <>
            <button
              className={buttonSecondaryClass}
              type="submit"
              disabled={pending || uploading}
              onClick={() => {
                if (intentRef.current) intentRef.current.value = "draft";
              }}
            >
              {pending ? "Saving…" : "Save draft"}
            </button>
            <button
              className={buttonClass}
              type="submit"
              disabled={pending || uploading}
              onClick={() => {
                if (intentRef.current) intentRef.current.value = "submitted";
              }}
            >
              {pending ? "Submitting…" : "Submit for review"}
            </button>
          </>
        ) : (
          <button className={buttonClass} type="submit" disabled={pending || uploading}>
            {pending ? "Saving…" : "Save article"}
          </button>
        )}
      </div>
    </form>
  );
}
