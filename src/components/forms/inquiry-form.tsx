"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch, type FieldValues, type Resolver, type UseFormRegister, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check, CheckCircle2, ChevronDown, Loader2, RotateCcw } from "lucide-react";
import { formSchemas, type ApiResponse, type FormKind } from "@/lib/inquiry/schema";
import { cn } from "@/lib/utils";
import { formConfigs, type FieldDef } from "./form-configs";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success"; inquiryId: string }
  | { state: "error"; title: string; message: string };

const REQUEST_TIMEOUT_MS = 25_000;

function newSubmissionId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0]! & (15 >> (Number(c) / 4)))).toString(16)
      );
}

function emptyValues(kind: FormKind): FieldValues {
  const v: FieldValues = { privacy: false };
  for (const g of formConfigs[kind].groups) for (const f of g.fields) v[f.name] = "";
  return { ...v, ...formConfigs[kind].defaults };
}

export function InquiryForm({ kind, fallbackEmail }: { kind: FormKind; fallbackEmail?: string | null }) {
  const config = formConfigs[kind];
  const formId = useId();
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const startedAt = useRef<number>(0);
  const submissionId = useRef<string>("");
  const honeypot = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: zodResolver(formSchemas[kind]) as unknown as Resolver<FieldValues>,
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: emptyValues(kind),
    shouldFocusError: true,
  });

  const message = useWatch({ control, name: "message" }) as string | undefined;

  useEffect(() => {
    startedAt.current = Date.now();
    submissionId.current = newSubmissionId();
  }, []);

  // Prefill from query string, e.g. /anfrage?automat=snackautomat
  useEffect(() => {
    if (!config.prefill) return;
    const params = new URLSearchParams(window.location.search);
    for (const [param, field] of Object.entries(config.prefill)) {
      const value = params.get(param);
      if (!value) continue;
      const def = config.groups.flatMap((g) => g.fields).find((f) => f.name === field);
      if (def && (def.kind === "radio" || def.kind === "select") && def.options.some((o) => o.value === value)) {
        setValue(field, value);
      }
    }
  }, [config, setValue]);

  useEffect(() => {
    if (status.state === "success") successRef.current?.focus();
    if (status.state === "error") alertRef.current?.focus();
  }, [status]);

  const onValid = async (values: FieldValues) => {
    if (status.state === "submitting") return;
    setStatus({ state: "submitting" });
    const { privacy, ...rest } = values;
    const payload = {
      form: kind,
      fields: { ...rest, privacy },
      meta: { submissionId: submissionId.current, startedAt: startedAt.current, website: honeypot.current?.value ?? "" },
    };

    let res: Response;
    try {
      res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      // Outcome unknown – keep the submission ID so a retry cannot create a duplicate e-mail.
      setStatus({
        state: "error",
        title: "Keine Verbindung",
        message: "Ihre Anfrage konnte nicht übertragen werden. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut. Ihre Angaben bleiben erhalten.",
      });
      return;
    }

    let data: ApiResponse | null = null;
    try {
      data = (await res.json()) as ApiResponse;
    } catch {
      data = null;
    }

    if (res.ok && data?.ok) {
      setStatus({ state: "success", inquiryId: data.inquiryId });
      reset(emptyValues(kind));
      submissionId.current = newSubmissionId();
      startedAt.current = Date.now();
      return;
    }

    // Definitive failure: a retry is a new submission.
    if (data && !data.ok && data.error !== "delivery_failed") submissionId.current = newSubmissionId();

    if (data && !data.ok && data.error === "validation" && data.fieldErrors) {
      const entries = Object.entries(data.fieldErrors);
      for (const [name, message] of entries) setError(name, { type: "server", message });
      setStatus({ state: "error", title: "Bitte prüfen Sie Ihre Angaben", message: data.message });
      if (entries[0]) setFocus(entries[0][0]);
      return;
    }
    if (data && !data.ok && data.error === "too_fast") startedAt.current = Date.now() - 60_000;

    setStatus({
      state: "error",
      title:
        res.status === 429 ? "Bitte etwas Geduld" : res.status === 503 ? "Formular vorübergehend nicht verfügbar" : "Senden fehlgeschlagen",
      message: data && !data.ok ? data.message : "Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.",
    });
  };

  if (status.state === "success") {
    return (
      <div className="rounded-panel border border-forest/20 bg-paper p-7 sm:p-10" role="status">
        <span className="grid size-12 place-items-center rounded-key bg-forest text-lime">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </span>
        <h2 ref={successRef} tabIndex={-1} className="type-h3 mt-6 outline-none">
          {config.successTitle}
        </h2>
        <p className="mt-3 max-w-xl text-ink/80">{config.successText}</p>
        <p className="mt-6 inline-flex flex-wrap items-center gap-2 rounded-key bg-cream px-4 py-3 text-sm">
          <span className="text-muted">Ihre Vorgangsnummer:</span>
          <strong className="font-mono tracking-wide">{status.inquiryId}</strong>
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setStatus({ state: "idle" })}
            className="inline-flex min-h-12 items-center gap-2 rounded-key border border-ink/20 px-5 font-semibold hover:border-ink"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Weitere Anfrage senden
          </button>
          <Link href="/" className="inline-flex min-h-12 items-center px-2 font-semibold text-forest underline-offset-4 hover:underline">
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  const submitting = status.state === "submitting";

  return (
    <form noValidate onSubmit={(e) => void handleSubmit(onValid)(e)} aria-busy={submitting} className="space-y-10" id={`${formId}-form`}>
      <p className="text-sm text-muted">
        Pflichtfelder sind mit <span aria-hidden="true" className="font-semibold text-error">*</span>
        <span className="sr-only">Sternchen</span> gekennzeichnet.
      </p>

      {config.groups.map((group) => (
        <fieldset key={group.legend} className="min-w-0">
          <legend className="slot-label mb-5 flex w-full items-center gap-2.5 border-b border-line pb-3 text-ink">
            <span aria-hidden="true" className="size-2 rounded-[2px] bg-forest" />
            {group.legend}
          </legend>
          <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
            {group.fields.map((f) => (
              <Field key={f.name} def={f} formId={formId} register={register} errors={errors} messageLength={f.name === "message" ? (message?.length ?? 0) : undefined} />
            ))}
          </div>
        </fieldset>
      ))}

      {/* Honeypot: hidden from people and assistive tech, attractive to bots. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor={`${formId}-website`}>Website (bitte leer lassen)</label>
        <input ref={honeypot} id={`${formId}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <PrivacyCheckbox formId={formId} register={register} error={errors.privacy?.message as string | undefined} />

      <div className="space-y-5 border-t border-line pt-8">
        {status.state === "error" ? (
          <div
            ref={alertRef}
            tabIndex={-1}
            role="alert"
            className="flex gap-3 rounded-key border border-error/30 bg-error-soft p-4 text-ink outline-none"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-error" aria-hidden="true" />
            <div>
              <p className="font-semibold">{status.title}</p>
              <p className="mt-1 text-sm text-ink/80">{status.message}</p>
              {fallbackEmail ? (
                <p className="mt-2 text-sm text-ink/80">
                  Alternativ erreichen Sie uns per E-Mail an{" "}
                  <a className="font-semibold text-forest underline" href={`mailto:${fallbackEmail}`}>
                    {fallbackEmail}
                  </a>
                  .
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={submitting}
            className="group/btn inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-key bg-forest px-6 font-semibold text-cream shadow-[inset_0_-3px_0_rgb(0_0_0/0.25)] transition-colors hover:bg-ink active:translate-y-px disabled:cursor-wait disabled:opacity-80 sm:w-auto"
          >
            {submitting ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                Wird gesendet …
              </>
            ) : status.state === "error" ? (
              <>
                <RotateCcw className="size-4" aria-hidden="true" />
                Erneut senden
              </>
            ) : (
              <>
                {config.submitLabel}
                <span aria-hidden="true" className="-mr-2 grid size-7 place-items-center rounded-[7px] bg-lime text-ink">
                  <Check className="size-4" strokeWidth={2.5} />
                </span>
              </>
            )}
          </button>
          <p className="text-sm text-muted sm:max-w-xs sm:text-right">Ihre Anfrage ist unverbindlich und verpflichtet Sie zu nichts.</p>
        </div>
        <p className="sr-only" aria-live="polite">
          {submitting ? "Ihre Anfrage wird gesendet." : ""}
        </p>
      </div>
    </form>
  );
}

const inputBase =
  "block w-full rounded-[12px] border bg-paper px-4 text-base text-ink placeholder:text-ink/40 transition-[border-color,box-shadow] outline-none focus:border-forest focus:shadow-[0_0_0_3px_rgb(18_56_42/0.15)]";

function describedBy(ids: (string | false | undefined)[]) {
  const v = ids.filter(Boolean).join(" ");
  return v || undefined;
}

function Field({
  def,
  formId,
  register,
  errors,
  messageLength,
}: {
  def: FieldDef;
  formId: string;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
  messageLength?: number;
}) {
  const id = `${formId}-${def.name}`;
  const error = errors[def.name]?.message as string | undefined;
  const hintId = def.hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const invalid = Boolean(error);
  const span = def.span === "full" ? "sm:col-span-2" : "";
  const borderCls = invalid ? "border-error bg-error-soft/40" : "border-ink/20 hover:border-ink/40";

  const label = (
    <>
      {def.label}
      {def.required ? (
        <span aria-hidden="true" className="ml-0.5 text-error">
          *
        </span>
      ) : null}
    </>
  );

  const meta = (
    <>
      {def.hint ? (
        <p id={hintId} className="mt-2 text-sm text-muted">
          {def.hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </>
  );

  if (def.kind === "radio") {
    return (
      <fieldset className={cn("min-w-0", span)} aria-describedby={describedBy([hintId, errorId])} aria-invalid={invalid || undefined}>
        <legend className="mb-3 font-semibold">{label}</legend>
        <div className="flex flex-wrap gap-2">
          {def.options.map((o) => (
            <label
              key={o.value}
              className={cn(
                "relative inline-flex min-h-12 cursor-pointer items-center gap-2.5 rounded-key border px-4 py-2 text-[0.95rem] font-medium transition-colors select-none",
                "has-[:checked]:border-forest has-[:checked]:bg-forest has-[:checked]:text-cream",
                "has-[:focus-visible]:outline-[2.5px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest has-[:focus-visible]:outline-solid",
                invalid ? "border-error bg-error-soft/40" : "border-ink/20 bg-paper hover:border-ink/50"
              )}
            >
              <input type="radio" value={o.value} className="peer sr-only" {...register(def.name)} />
              <span
                aria-hidden="true"
                className="size-3 rounded-[3px] border border-current opacity-60 peer-checked:border-lime peer-checked:bg-lime peer-checked:opacity-100"
              />
              {o.label}
            </label>
          ))}
        </div>
        {meta}
      </fieldset>
    );
  }

  return (
    <div className={cn("min-w-0", span)}>
      <label htmlFor={id} className="mb-2 block font-semibold">
        {label}
      </label>
      {def.kind === "text" ? (
        <input
          id={id}
          type={def.type ?? "text"}
          autoComplete={def.autoComplete}
          inputMode={def.inputMode}
          placeholder={def.placeholder}
          maxLength={def.maxLength}
          aria-required={def.required || undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy([hintId, errorId])}
          className={cn(inputBase, "h-13", borderCls)}
          {...register(def.name)}
        />
      ) : def.kind === "select" ? (
        <div className="relative">
          <select
            id={id}
            aria-required={def.required || undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy([hintId, errorId])}
            className={cn(inputBase, "h-13 appearance-none pr-11", borderCls)}
            {...register(def.name)}
          >
            <option value="">{def.placeholder ?? "Bitte wählen"}</option>
            {def.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-ink/60" aria-hidden="true" />
        </div>
      ) : (
        <>
          <textarea
            id={id}
            rows={def.rows ?? 5}
            placeholder={def.placeholder}
            maxLength={def.maxLength}
            aria-required={def.required || undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy([hintId, errorId, `${id}-count`])}
            className={cn(inputBase, "min-h-36 resize-y py-3.5 leading-relaxed", borderCls)}
            {...register(def.name)}
          />
          {def.maxLength ? (
            <p id={`${id}-count`} className="mt-1.5 text-right font-mono text-xs text-muted">
              {messageLength ?? 0} / {def.maxLength}
              <span className="sr-only"> Zeichen</span>
            </p>
          ) : null}
        </>
      )}
      {meta}
    </div>
  );
}

function PrivacyCheckbox({ formId, register, error }: { formId: string; register: UseFormRegister<FieldValues>; error?: string }) {
  const id = `${formId}-privacy`;
  return (
    <div>
      <div className="flex items-start gap-3.5">
        <span className="relative mt-0.5 grid size-6 shrink-0">
          <input
            id={id}
            type="checkbox"
            aria-required="true"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(
              "peer size-6 cursor-pointer appearance-none rounded-[7px] border-2 bg-paper transition-colors checked:border-forest checked:bg-forest",
              error ? "border-error" : "border-ink/30"
            )}
            {...register("privacy")}
          />
          <Check
            aria-hidden="true"
            strokeWidth={3}
            className="pointer-events-none absolute inset-0 m-auto size-4 text-lime opacity-0 peer-checked:opacity-100"
          />
        </span>
        <label htmlFor={id} className="text-[0.95rem] text-ink/85">
          Ich habe die{" "}
          <Link href="/datenschutz" target="_blank" className="font-semibold text-forest underline underline-offset-2">
            Datenschutzhinweise
            <span className="sr-only"> (öffnet in neuem Tab)</span>
          </Link>{" "}
          zur Kenntnis genommen. Meine Angaben werden ausschließlich zur Bearbeitung meiner Anfrage verwendet.
          <span aria-hidden="true" className="ml-0.5 text-error">
            *
          </span>
        </label>
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-1.5 pl-9.5 text-sm font-medium text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
