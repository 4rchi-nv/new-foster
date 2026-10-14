"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { track } from "@/components/analytics/track";
import type { Locale } from "@/lib/i18n/locales";
import { copy } from "@/lib/i18n/ui";
import { inspectUpload, MAX_FILES } from "@/lib/inquiry/files";
import { submitInquiry, type InquiryState } from "@/lib/inquiry/submit";
import { formatBytes } from "@/lib/utils";

const initial: InquiryState | null = null;

export function ProjectInquiryForm({ locale, source = "" }: { locale: Locale; source?: string }) {
  const t = copy(locale).form;
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string>("");
  const [started, setStarted] = useState(false);

  function noteStart() {
    if (started) return;
    setStarted(true);
    track("form_start");
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    for (const file of list) {
      if (next.length >= MAX_FILES) {
        setFileError(t.errors.count);
        break;
      }
      const issue = inspectUpload({ name: file.name, type: file.type, size: file.size });
      if (issue) {
        setFileError(t.errors[issue]);
        continue;
      }
      next.push(file);
      setFileError("");
      track("spec_upload", { type: file.name.split(".").pop() || "file" });
    }
    setFiles(next);
  }

  useEffect(() => {
    if (state?.ok) track("inquiry_success");
  }, [state]);

  if (state?.ok) {
    return (
      <p className="border border-border bg-surface px-5 py-6 text-success" role="status">
        {t.success}
      </p>
    );
  }

  const fieldError = (key: string) => (state?.fields?.[key] ? t.errors[key as keyof typeof t.errors] : "");
  const formError = state?.error && state.error !== "validation"
    ? state.error === "file" && state.file
      ? t.errors[state.file]
      : t.errors[state.error]
    : "";

  return (
    <form action={action} className="grid gap-5" onFocus={noteStart} noValidate>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="source" value={source} />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t.name} name="name" error={fieldError("name")} autoComplete="name" />
        <Field label={t.company} name="company" error={fieldError("company")} autoComplete="organization" />
        <Field label={t.phone} name="phone" error={fieldError("phone")} autoComplete="tel" />
        <Field label={t.email} name="email" error={fieldError("email")} autoComplete="email" type="email" />
      </div>
      <label className="grid gap-2 text-sm">
        <span>{t.message}</span>
        <textarea name="message" rows={6} className="border border-border bg-surface px-3 py-3 text-base" />
        {fieldError("message") ? <span className="text-danger">{fieldError("message")}</span> : null}
      </label>
      <div className="grid gap-2 text-sm">
        <span>{t.files}</span>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="text-sm file:mr-3 file:border file:border-border file:bg-surface file:px-3 file:py-2"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <p className="text-muted">{t.filesHint}</p>
        {fileError ? <p className="text-danger">{fileError}</p> : null}
        {files.length ? (
          <ul className="divide-y divide-border border-y border-border">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 py-2">
                <span>{file.name} <span className="font-mono text-xs text-muted">{formatBytes(file.size)}</span></span>
                <button type="button" className="text-sm underline" onClick={() => setFiles(files.filter((_, item) => item !== index))}>
                  {t.removeFile}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <FileBag files={files} />
      <label className="flex items-start gap-3 text-sm leading-6">
        <input type="checkbox" name="consent" value="yes" className="mt-1" />
        <span>{t.consent}</span>
      </label>
      {fieldError("consent") ? <p className="text-sm text-danger">{fieldError("consent")}</p> : null}
      {formError ? <p className="text-sm text-danger" role="alert">{formError}</p> : null}
      <button type="submit" disabled={pending} className="chamfer w-fit bg-foreground px-5 py-3 text-surface disabled:opacity-60 [--cut:10px]">
        {pending ? t.sending : t.submit}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  type = "text",
  autoComplete,
}: {
  label: string;
  name: string;
  error: string;
  type?: string;
  autoComplete: string;
}) {
  const id = `inquiry-${name}`;
  return (
    <label htmlFor={id} className="grid gap-2 text-sm">
      <span>{label}</span>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="border border-border bg-surface px-3 py-3 text-base"
      />
      {error ? <span id={`${id}-error`} className="text-danger">{error}</span> : null}
    </label>
  );
}

function FileBag({ files }: { files: File[] }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const transfer = new DataTransfer();
    for (const file of files) transfer.items.add(file);
    node.files = transfer.files;
  }, [files]);
  return <input ref={ref} type="file" name="files" className="hidden" tabIndex={-1} aria-hidden />;
}
