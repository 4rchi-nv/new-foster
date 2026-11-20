import { cn } from "@/lib/utils";

export type SkeletonVariant = "home" | "page" | "list" | "detail" | "contact" | "text";

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-sm bg-surface-muted motion-reduce:animate-none", className)} />;
}

function Hero({ tall = false }: { tall?: boolean }) {
  return (
    <header className="border-b border-border">
      <div className={cn("mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-10", tall ? "py-16 md:py-24" : "py-14 md:py-20")}>
        <Bone className="h-3 w-28" />
        <Bone className={cn("mt-6", tall ? "h-14 w-full max-w-3xl" : "h-10 w-full max-w-xl")} />
        <Bone className="mt-5 h-5 w-full max-w-lg" />
        {tall ? <Bone className="mt-3 h-5 w-2/3 max-w-md" /> : null}
      </div>
    </header>
  );
}

function Rows({ count }: { count: number }) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="grid gap-3 py-5 md:grid-cols-[4rem_minmax(0,14rem)_1fr]">
          <Bone className="h-4 w-8" />
          <Bone className="h-5 w-40" />
          <Bone className="h-4 w-full max-w-md" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ variant }: { variant: SkeletonVariant }) {
  return (
    <div className="min-h-[70vh]" role="status" aria-live="polite" aria-busy="true">
      <p className="sr-only">
        <span lang="ru">Загрузка страницы.</span> <span lang="en">Loading page.</span>
      </p>
      <div className="h-1 bg-brand" aria-hidden />
      {variant === "home" ? <HomeSkeleton /> : null}
      {variant === "page" ? <PageBody /> : null}
      {variant === "list" ? <ListSkeleton /> : null}
      {variant === "detail" ? <DetailSkeleton /> : null}
      {variant === "contact" ? <ContactSkeleton /> : null}
      {variant === "text" ? <TextSkeleton /> : null}
    </div>
  );
}

function HomeSkeleton() {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto grid w-full max-w-[1360px] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:px-10 lg:py-24">
          <div>
            <Bone className="h-3 w-32" />
            <Bone className="mt-6 h-16 w-full max-w-3xl" />
            <Bone className="mt-6 h-5 w-full max-w-xl" />
            <div className="mt-8 flex gap-3">
              <Bone className="h-11 w-36" />
              <Bone className="h-11 w-40" />
            </div>
          </div>
          <Bone className="min-h-48 w-full" />
        </div>
      </header>
      <div className="mx-auto w-full max-w-[1360px] px-4 py-16 sm:px-6 lg:px-10 md:py-24">
        <Bone className="h-8 w-64" />
        <div className="mt-8">
          <Rows count={5} />
        </div>
      </div>
    </>
  );
}

function PageBody() {
  return (
    <>
      <Hero />
      <div className="mx-auto grid w-full max-w-[1360px] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(240px,0.7fr)] lg:px-10 md:py-24">
        <div className="space-y-4">
          <Bone className="h-8 w-72" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-4/5" />
        </div>
        <Bone className="min-h-48 w-full" />
      </div>
    </>
  );
}

function ListSkeleton() {
  return (
    <>
      <Hero />
      <div className="mx-auto w-full max-w-[1360px] px-4 py-16 sm:px-6 lg:px-10 md:py-24">
        <div className="flex flex-wrap gap-2">
          <Bone className="h-9 w-16" />
          <Bone className="h-9 w-24" />
          <Bone className="h-9 w-28" />
        </div>
        <div className="mt-8">
          <Rows count={4} />
        </div>
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <>
      <Hero />
      <div className="mx-auto grid w-full max-w-[1360px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-10 md:py-24">
        <Bone className="min-h-64 w-full" />
        <div className="space-y-4">
          <Bone className="h-8 w-56" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-3/4" />
        </div>
      </div>
    </>
  );
}

function ContactSkeleton() {
  return (
    <>
      <Hero />
      <div className="mx-auto w-full max-w-[1360px] px-4 py-16 sm:px-6 lg:px-10 md:py-24">
        <Bone className="h-8 w-48" />
        <div className="mt-8 max-w-3xl divide-y divide-border border-y border-border">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="grid gap-2 py-4 sm:grid-cols-[12rem_1fr]">
              <Bone className="h-4 w-24" />
              <Bone className="h-4 w-full max-w-sm" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function TextSkeleton() {
  return (
    <>
      <Hero />
      <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-16 sm:px-6 lg:px-10 md:py-24">
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-11/12" />
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-4/5" />
      </div>
    </>
  );
}
