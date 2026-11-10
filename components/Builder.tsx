"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthDialog } from "./AuthDialog";
import { AppNav } from "./AppNav";
import { BioStep, DetailsStep, EducationStep, ExperienceStep, SkillsStep } from "./EditorSteps";
import { ExamplesBrowsePage } from "./ExamplesBrowsePage";
import { ExtrasStep } from "./ExtrasStep";
import { JobStep } from "./JobStep";
import { PlanDialog } from "./PlanDialog";
import { ProfilePage } from "./ProfilePage";
import { PublicCvPage } from "./PublicCvPage";
import { ResumeView } from "./ResumeSheet";
import { StepCard } from "./StepCard";
import { AboutPage } from "./AboutPage";
import { ContactPage } from "./ContactPage";
import { Landing, type DashIntent } from "./Landing";
import { LoadScreen } from "./LoadScreen";
import { CvMobileChrome, CvSectionRail, SliceBack, SliceContinue, SliceViewCv } from "./CvChrome";
import { DOCK_ORDER } from "./SideNav";
import { ProfileDialog } from "./ProfileDialog";
import { TemplateDialog } from "./TemplateDialog";
import { IconChevronLeft, IconDownload, IconEye, IconPalette } from "./icons";
import { adjustResume, ensureResume, importResume, improveText, loadMine, loadRatings, readJobLink, updateResume } from "@/lib/api";
import { blank } from "@/lib/content";
import { panelPath, pathToView } from "@/lib/paths";
import { checkpoints, completeness } from "@/lib/progress";
import { stepErrors } from "@/lib/validate";
import { useAccount } from "@/lib/useAccount";
import { downloadResumePdf, printResume } from "@/lib/pdf";
import { newId } from "@/lib/id";
import { isFontId, readTemplateId, type Category, type PanelId, type RatingSummary, type ResumeData, type ResumeRecord, type TemplateId } from "@/lib/types";

/** Phone Continue skips the job post. The desktop rail still lists it. */
const PHONE_STEPS = DOCK_ORDER.filter((id) => id !== "job");

type Snapshot = {
  id: string | null;
  templateId: TemplateId;
  category: Category;
  isPublic: boolean;
  slug: string | null;
  jobDescription: string;
  data: ResumeData;
  updatedAt?: string;
};

const OWNER_KEY = "cv-matters-owner";
const ACTIVE_KEY = "cv-matters-active";

function ownerKey() {
  const existing = localStorage.getItem(OWNER_KEY);
  if (existing) return existing;
  const created = newId();
  localStorage.setItem(OWNER_KEY, created);
  return created;
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function Builder() {
  const pathname = usePathname();
  const router = useRouter();
  const view = pathToView(pathname);
  const [mode, setMode] = useState<"loading" | "start" | "ready">("loading");
  const [panel, setPanel] = useState<PanelId | null>(null);

  const goPanel = (id: PanelId) => {
    if (id !== panel) setPanel(id);
    router.push(panelPath(id), { scroll: false });
  };
  const [rating, setRating] = useState<RatingSummary | undefined>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("");
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error" | "idle">("idle");
  const [improving, setImproving] = useState<string | null>(null);
  const [adjusting, setAdjusting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [aiNote, setAiNote] = useState("");
  const [picked, setPicked] = useState<{ section: PanelId; focusId?: string; tick: number } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [lookIntent, setLookIntent] = useState<"layout" | "look">("layout");
  const [profileOpen, setProfileOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [gate, setGate] = useState<null | "auth" | "plan">(null);
  const [gateReason, setGateReason] = useState("");
  const [snapshot, setSnapshot] = useState<Snapshot>({
    id: null,
    templateId: "mint",
    category: "Design",
    isPublic: false,
    slug: null,
    jobDescription: "",
    data: blank,
  });

  const owner = useRef("");
  const account = useAccount(() => owner.current);
  const afterGate = useRef<null | "download" | "print">(null);

  const live = useRef(snapshot);
  live.current = snapshot;
  const booted = useRef(false);
  const saveLock = useRef({ running: false, pending: false });
  const scrollRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ x: number; y: number; locked: "x" | "y" | null } | null>(null);

  const patch = (next: Partial<Snapshot>) => {
    setSnapshot((current) => ({ ...current, ...next }));
  };

  const applyRecord = (record: ResumeRecord) => {
    booted.current = false;
    sessionStorage.setItem(ACTIVE_KEY, record.id);
    setSnapshot({
      id: record.id,
      templateId: readTemplateId(record.templateId),
      category: record.category,
      isPublic: record.isPublic,
      slug: record.slug || null,
      jobDescription: record.jobDescription,
      updatedAt: record.updatedAt,
      data: {
        ...blank,
        ...record.data,
        fontId: isFontId(record.data.fontId) ? record.data.fontId : "sans",
        personal: { ...blank.personal, ...record.data.personal },
      },
    });
    if (record.rating) setRating(record.rating);
  };

  const flush = async () => {
    const lock = saveLock.current;
    if (lock.running) {
      lock.pending = true;
      return;
    }
    lock.running = true;
    try {
      do {
        lock.pending = false;
        const current = live.current;
        if (!current.id || !owner.current) break;
        setSaveState("saving");
        await updateResume(current.id, {
          ownerKey: owner.current,
          templateId: readTemplateId(current.templateId),
          category: current.category,
          isPublic: current.isPublic,
          jobDescription: current.jobDescription,
          data: current.data,
        });
        setSaveState("saved");
      } while (lock.pending);
    } catch {
      setSaveState("error");
    } finally {
      lock.running = false;
    }
  };

  useEffect(() => {
    let cancelled = false;
    owner.current = ownerKey();
    const active = sessionStorage.getItem(ACTIVE_KEY) || "";
    const open = (id?: string) => loadMine(owner.current, id);
    open(active || undefined)
      .catch(() => (active ? open() : Promise.reject(new Error("None"))))
      .then((record) => {
        if (cancelled || !record) return;
        applyRecord(record);
        setMode("ready");
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        const message = reason instanceof Error ? reason.message : "";
        if (message !== "None" && !message.includes("404")) {
          setError("Can't reach the server. Start it, then refresh.");
        }
        setMode("start");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode !== "ready" || !snapshot.id) return;
    if (!booted.current) {
      booted.current = true;
      return;
    }
    const timer = window.setTimeout(() => {
      void flush();
    }, 600);
    return () => window.clearTimeout(timer);
  }, [mode, snapshot]);

  useEffect(() => {
    setPage(0);
    setShowErrors(false);
  }, [panel]);

  useEffect(() => {
    setShowErrors(false);
  }, [page]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [panel, page]);

  const steps = useSyncExternalStore(
    (notify) => {
      const media = window.matchMedia("(max-width: 860px)");
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    () => (window.matchMedia("(max-width: 860px)").matches ? PHONE_STEPS : DOCK_ORDER),
    () => DOCK_ORDER,
  );
  const dockIndex = panel ? steps.indexOf(panel) : -1;

  const onSwipeStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, button, a, [contenteditable='true'], .fld-box, .rich-line")) return;
    swipeRef.current = { x: event.clientX, y: event.clientY, locked: null };
  };

  const onSwipeMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    if (!start || start.locked) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    start.locked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
  };

  const onSwipeEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start || start.locked !== "x" || dockIndex < 0) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) < 56) return;
    if (dx < 0 && dockIndex < steps.length - 1) goPanel(steps[dockIndex + 1]);
    else if (dx > 0 && dockIndex > 0) goPanel(steps[dockIndex - 1]);
  };

  useEffect(() => {
    if (pathname === "/home") router.replace("/");
  }, [pathname, router]);

  useEffect(() => {
    if (mode === "loading") return;
    if (view.kind === "start") return;
    if (view.kind === "cv" && view.section !== panel) setPanel(view.section);
  }, [mode, pathname]);

  useEffect(() => {
    if (mode !== "start" || view.kind !== "examples") return;
    router.replace("/");
  }, [mode, view.kind, router]);

  useEffect(() => {
    if (!snapshot.id) return;
    loadRatings(snapshot.id)
      .then((next) => setRating({ average: next.average, count: next.count, mine: next.mine }))
      .catch(() => {});
  }, [snapshot.id]);

  const onImprove = async (key: string, kind: "summary" | "bullets" | "tailor", text: string) => {
    setImproving(key);
    setAiNote("");
    try {
      const result = await improveText({
        kind,
        text,
        role: live.current.data.personal.title,
        jobDescription: live.current.jobDescription,
      });
      return result.text;
    } catch {
      setAiNote("Couldn't improve that just now.");
      return null;
    } finally {
      setImproving(null);
    }
  };

  const onAdjust = async (text: string) => {
    setAdjusting(true);
    setAiNote("");
    try {
      let job = text.trim();
      if (/^https?:\/\/\S+$/i.test(job)) {
        const read = await readJobLink(job);
        job = read.text;
      }
      const current = live.current;
      const result = await adjustResume({
        summary: current.data.summary,
        experience: current.data.experience,
        role: current.data.personal.title,
        jobDescription: job,
      });
      setSnapshot((latest) => ({
        ...latest,
        jobDescription: job,
        data: { ...latest.data, summary: result.summary, experience: result.experience },
      }));
    } catch {
      setAiNote("Couldn't adjust the CV from that post.");
    } finally {
      setAdjusting(false);
    }
  };

  const destination = (intent: DashIntent): PanelId => (intent === "job" ? "job" : "details");

  const afterCreateNavigate = (intent: DashIntent) => {
    if (intent === "field") {
      setPanel("details");
      router.push("/examples");
      return;
    }
    const next = destination(intent);
    setPanel(next);
    router.push(panelPath(next));
  };

  /** Write this page over the saved CV, then open the section the dashboard asked for. */
  const replaceRecord = async (
    data: ResumeData,
    intent: DashIntent,
    templateId: TemplateId,
    extra?: { jobDescription?: string; category?: Category },
  ) => {
    const category = extra?.category || "Design";
    const record = await ensureResume(owner.current, templateId, category, data);
    const saved = await updateResume(record.id, {
      ownerKey: owner.current,
      templateId,
      category,
      isPublic: record.isPublic,
      jobDescription: extra?.jobDescription ?? "",
      data,
    });
    applyRecord(saved);
    setMode("ready");
    afterCreateNavigate(intent);
  };

  const download = async () => {
    setDownloading(true);
    setPdfError("");
    try {
      await downloadResumePdf(live.current.data.personal.fullName);
    } catch (error) {
      console.error("PDF export failed", error);
      setPdfError(error instanceof Error ? error.message : "Couldn't download the PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const print = () => {
    setPdfError("");
    try {
      printResume(live.current.data.personal.fullName);
    } catch {
      setPdfError("Nothing to print yet.");
    }
  };

  /** Account first, then a live subscription, then the file. */
  const requestPdf = (how: "download" | "print") => {
    if (!account.user) {
      afterGate.current = how;
      setGateReason(`Create an account to ${how === "print" ? "print" : "download"} your resume.`);
      setGate("auth");
      return;
    }
    if (!account.entitlement.canDownload) {
      afterGate.current = how;
      setGateReason("Downloads come with a subscription. Pick a plan to carry on.");
      setGate("plan");
      return;
    }
    if (how === "print") print();
    else void download();
  };

  // only shown once Continue has been pressed, so nothing turns red while typing
  const errors = showErrors ? stepErrors(panel, page, snapshot.data) : {};

  if (mode === "loading" && view.kind !== "public" && view.kind !== "about" && view.kind !== "contact") {
    return <LoadScreen message="Opening CV Matters…" />;
  }

  if (view.kind === "about") {
    return <AboutPage />;
  }

  if (view.kind === "contact") {
    return <ContactPage />;
  }

  if (view.kind === "public") {
    return (
      <div className="app-frame is-public">
        <PublicCvPage
          id={view.id}
          signedIn={!!account.user}
          onSignIn={() => {
            setGateReason("Sign in to rate this resume.");
            setGate("auth");
          }}
        />
        <AuthDialog
          open={gate === "auth"}
          reason={gateReason}
          ownerKey={owner.current}
          onRegister={account.register}
          onLogin={account.login}
          onAuthenticated={() => setGate(null)}
          onClose={() => setGate(null)}
        />
      </div>
    );
  }

  const begin = async (intent: DashIntent, templateId: TemplateId, data: ResumeData, label: string) => {
    setBusy(true);
    setBusyLabel(label);
    setError("");
    try {
      await replaceRecord(data, intent, templateId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Couldn't start that CV.");
    } finally {
      setBusy(false);
    }
  };

  if (mode === "start" && view.kind !== "examples" && view.kind !== "profile") {
    return (
      <Landing
        busy={busy}
        busyLabel={busyLabel}
        error={error}
        onCreate={(intent, templateId) => begin(intent, templateId, structuredClone(blank), "Starting your CV…")}
        onUpload={async (file, intent, templateId) => {
          if (file.size > 4_000_000) {
            setError("That file is larger than 4 MB.");
            return;
          }
          setBusy(true);
          setBusyLabel("Reading your file…");
          setError("");
          try {
            const encoded = await fileToBase64(file);
            const parsed = await importResume(file.name, encoded);
            await replaceRecord(parsed.data, intent, templateId);
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Couldn't read that file.");
          } finally {
            setBusy(false);
          }
        }}
        onLinkedin={(url, name, intent, templateId) =>
          begin(intent, templateId, { ...blank, personal: { ...blank.personal, fullName: name, linkedin: url } }, "Starting from your profile…")
        }
      />
    );
  }

  if (view.kind === "start") {
    return (
      <Landing
        data={snapshot.data}
        templateId={snapshot.templateId}
        busy={busy}
        busyLabel={busyLabel}
        error={error}
        onOpen={(intent) => {
          if (intent === "field") {
            setPanel("details");
            router.push("/examples");
            return;
          }
          const next = destination(intent);
          setPanel(next);
          router.push(panelPath(next));
        }}
        onCreate={(intent, templateId) => begin(intent, templateId, structuredClone(blank), "Starting your CV…")}
        onUpload={async (file, intent, templateId) => {
          if (file.size > 4_000_000) {
            setError("That file is larger than 4 MB.");
            return;
          }
          setBusy(true);
          setBusyLabel("Reading your file…");
          setError("");
          try {
            const encoded = await fileToBase64(file);
            const parsed = await importResume(file.name, encoded);
            await replaceRecord(parsed.data, intent, templateId);
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Couldn't read that file.");
          } finally {
            setBusy(false);
          }
        }}
        onLinkedin={(url, name, intent, templateId) =>
          begin(intent, templateId, { ...blank, personal: { ...blank.personal, fullName: name, linkedin: url } }, "Starting from your profile…")
        }
      />
    );
  }

  return (
    <div className="app-frame">
      {view.kind !== "cv" && view.kind !== "examples" && view.kind !== "profile" && <AppNav view={view} />}

      {view.kind === "profile" && (
        <ProfilePage
          data={snapshot.data}
          category={snapshot.category}
          isPublic={snapshot.isPublic}
          rating={rating}
          account={account}
          resumeId={snapshot.id}
          slug={snapshot.slug}
          ownerKey={owner.current}
          onShare={() => setProfileOpen(true)}
          onPlans={() => {
            afterGate.current = null;
            setGateReason("");
            setGate("plan");
          }}
          onSaved={({ slug, isPublic }) => {
            patch({ slug, isPublic });
            live.current = { ...live.current, slug, isPublic };
          }}
          onUse={(record) => {
            applyRecord(record);
            router.push("/cv/details");
          }}
          onPreviewCv={(record) => {
            applyRecord(record);
            setPreviewOpen(true);
          }}
        />
      )}

      {view.kind === "examples" && mode === "ready" && (
        <ExamplesBrowsePage
          panel={panel}
          data={snapshot.data}
          jobDescription={snapshot.jobDescription}
          mineId={snapshot.id}
          category={snapshot.category}
          account={account}
          onPanel={goPanel}
          downloading={downloading}
          onDownload={() => requestPdf("download")}
          onTemplate={() => {
            setLookIntent("look");
            setTemplatesOpen(true);
          }}
        />
      )}

      {view.kind === "cv" && (
      <div className="cv-editor-shell">
        <CvSectionRail
          panel={panel}
          data={snapshot.data}
          jobDescription={snapshot.jobDescription}
          onPanel={goPanel}
        />
        <div className="layout">
        <main className="work">
          <CvMobileChrome
            panel={panel}
            downloading={downloading}
            onPreview={() => setPreviewOpen(true)}
            onDownload={() => requestPdf("download")}
            onOpenDesign={() => {
              setLookIntent("look");
              setTemplatesOpen(true);
            }}
          />
          <div
            className="work-scroll"
            ref={scrollRef}
            onPointerDown={onSwipeStart}
            onPointerMove={onSwipeMove}
            onPointerUp={onSwipeEnd}
            onPointerCancel={() => {
              swipeRef.current = null;
            }}
          >
            <div className="work-inner">
              {error && <p className="form-alert">{error}</p>}
              {aiNote && <p className="form-alert">{aiNote}</p>}

              {panel === "details" && (
                <DetailsStep
                  data={snapshot.data}
                  templateId={snapshot.templateId}
                  errors={errors}
                  onData={(data) => patch({ data })}
                />
              )}
              {panel === "bio" && (
                <BioStep data={snapshot.data} onData={(data) => patch({ data })} onImprove={onImprove} improving={improving} />
              )}
              {panel === "experience" && (
                <ExperienceStep
                  data={snapshot.data}
                  onData={(data) => patch({ data })}
                  onImprove={onImprove}
                  improving={improving}
                  errors={errors}
                  focusId={picked?.section === "experience" ? picked.focusId : undefined}
                  focusTick={picked?.tick}
                />
              )}
              {panel === "education" && (
                <EducationStep
                  data={snapshot.data}
                  onData={(data) => patch({ data })}
                  errors={errors}
                  focusId={picked?.section === "education" ? picked.focusId : undefined}
                  focusTick={picked?.tick}
                />
              )}
              {panel === "skills" && <SkillsStep data={snapshot.data} onData={(data) => patch({ data })} />}

              {panel === "extras" && <ExtrasStep data={snapshot.data} onData={(data) => patch({ data })} />}

              {panel === "compare" && (
                <div className="finish-panel">
                  <header className="finish-head">
                    <h1>Your PDF</h1>
                    <p>Check the page on the right, then download when it looks right.</p>
                  </header>

                  <div className="finish-sheet">
                    <div className="finish-meter" aria-label={`${completeness(snapshot.data)} percent complete`}>
                      <div className="finish-meter-top">
                        <strong>{completeness(snapshot.data)}%</strong>
                        <span>sections ready</span>
                      </div>
                      <div className="finish-meter-track">
                        <i style={{ width: `${completeness(snapshot.data)}%` }} />
                      </div>
                    </div>

                    <ul className="finish-checks">
                      {checkpoints(snapshot.data).map((mark) => (
                        <li key={mark.id}>
                          <button
                            type="button"
                            className={mark.done ? "finish-check is-done" : "finish-check"}
                            onClick={() => goPanel(mark.id)}
                          >
                            <span className="finish-check-mark" aria-hidden="true">
                              {mark.done ? "✓" : ""}
                            </span>
                            <span className="finish-check-copy">
                              <strong>{mark.label}</strong>
                              <em>{mark.tally}</em>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>

                    <button type="button" className="finish-get" disabled={downloading} onClick={() => requestPdf("download")}>
                      {downloading ? <i className="mn-spin" aria-hidden="true" /> : <IconDownload />}
                      {downloading ? "Building PDF…" : account.entitlement.canDownload ? "Download PDF" : "Unlock PDF"}
                    </button>

                    {pdfError ? <p className="look-bad">{pdfError}</p> : null}
                  </div>
                </div>
              )}

              {panel === "job" && (
                <JobStep
                  data={snapshot.data}
                  jobDescription={snapshot.jobDescription}
                  onJob={(jobDescription) => patch({ jobDescription })}
                  onAdjust={onAdjust}
                  adjusting={adjusting}
                  onSeeField={() => router.push("/examples")}
                />
              )}
            </div>
          </div>

          {dockIndex >= 0 && (
            <div className="work-bar">
              <SliceBack
                disabled={dockIndex <= 0}
                onClick={() => {
                  if (dockIndex > 0) goPanel(steps[dockIndex - 1]);
                }}
              />
              <SliceViewCv
                onPreview={() => setPreviewOpen(true)}
                onDesign={() => {
                  setLookIntent("look");
                  setTemplatesOpen(true);
                }}
              />
              <SliceContinue
                label={dockIndex >= steps.length - 1 ? "Download" : "Continue"}
                onClick={async () => {
                  const found = panel ? stepErrors(panel, page, live.current.data) : {};
                  if (Object.keys(found).length) {
                    setShowErrors(true);
                    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                    return;
                  }
                  await flush();
                  if (dockIndex < steps.length - 1) {
                    goPanel(steps[dockIndex + 1]);
                    return;
                  }
                  requestPdf("download");
                }}
              />
            </div>
          )}
        </main>

        <aside className="look">
          <div className="look-sheet">
            <div className="look-head">
              <div className="look-actions" role="toolbar" aria-label="Resume look">
                <button
                  type="button"
                  className="look-action is-main"
                  onClick={() => {
                    setLookIntent("look");
                    setTemplatesOpen(true);
                  }}
                >
                  <IconPalette />
                  <span>Template</span>
                </button>
                <button type="button" className="look-action" onClick={() => setPreviewOpen(true)}>
                  <IconEye />
                  <span>Preview</span>
                </button>
                <button type="button" className="look-action" disabled={downloading} onClick={() => requestPdf("download")}>
                  <IconDownload />
                  <span>{downloading ? "Building…" : "Download"}</span>
                </button>
              </div>
            </div>
            <div className="look-paper" key={snapshot.templateId}>
              <ResumeView
                templateId={snapshot.templateId}
                data={snapshot.data}
                hideContact={false}
                onPick={(section, focusId) => {
                  goPanel(section);
                  setPicked({ section, focusId, tick: Date.now() });
                }}
              />
            </div>
          </div>
        </aside>
      </div>
      </div>
      )}

      {previewOpen && (view.kind === "cv" || view.kind === "profile") && (
        <div className="preview-sheet" role="dialog" aria-label="Resume preview">
          <div className="preview-sheet-top">
            <button
              type="button"
              className="preview-sheet-icon preview-sheet-back"
              aria-label={view.kind === "profile" ? "Close preview" : "Back to editing"}
              onClick={() => setPreviewOpen(false)}
            >
              <IconChevronLeft />
            </button>
            <button
              type="button"
              className="preview-sheet-icon preview-sheet-dl"
              aria-label={downloading ? "Building PDF" : "Download PDF"}
              disabled={downloading}
              onClick={() => requestPdf("download")}
            >
              <IconDownload />
            </button>
          </div>
          <div className="preview-sheet-body">
            <ResumeView
              templateId={snapshot.templateId}
              data={snapshot.data}
              hideContact={false}
              onPick={
                view.kind === "cv"
                  ? (section, focusId) => {
                      setPreviewOpen(false);
                      goPanel(section);
                      setPicked({ section, focusId, tick: Date.now() });
                    }
                  : undefined
              }
            />
          </div>
        </div>
      )}

      <ProfileDialog
        open={profileOpen}
        account={account}
        data={snapshot.data}
        category={snapshot.category}
        isPublic={snapshot.isPublic}
        busy={saveState === "saving"}
        onClose={() => setProfileOpen(false)}
        onData={(data) => patch({ data })}
        onCategory={(category) => patch({ category })}
        onPublic={async (isPublic) => {
          patch({ isPublic });
          live.current = { ...live.current, isPublic };
          await flush();
        }}
      />

      <TemplateDialog
        open={templatesOpen}
        intent={lookIntent}
        templateId={snapshot.templateId}
        data={snapshot.data}
        onClose={() => setTemplatesOpen(false)}
        onTemplate={(templateId) => {
          // Classic is a serif layout — land on Libre when switching to it so the
          // page matches the dashboard sample instead of keeping a leftover sans.
          if (templateId === "formal" && snapshot.data.fontId !== "libre") {
            patch({ templateId, data: { ...snapshot.data, fontId: "libre" } });
            return;
          }
          patch({ templateId });
        }}
        onFont={(fontId) => patch({ data: { ...snapshot.data, fontId } })}
        onAccent={(accent) => patch({ data: { ...snapshot.data, accent } })}
        onStyle={(look) => setSnapshot((current) => ({ ...current, data: { ...current.data, ...look } }))}
      />

      <AuthDialog
        open={gate === "auth"}
        ownerKey={owner.current}
        reason={gateReason}
        onRegister={account.register}
        onLogin={account.login}
        onAuthenticated={() => setGate(null)}
        onClose={() => setGate(null)}
      />

      <PlanDialog
        open={gate === "plan"}
        account={account}
        reason={gateReason}
        onClose={() => setGate(null)}
        onSignIn={() => {
          setGateReason("Sign in to subscribe and download.");
          setGate("auth");
        }}
        onPaid={() => {
          const wanted = afterGate.current;
          afterGate.current = null;
          if (wanted === "print") print();
          else if (wanted === "download") void download();
        }}
      />
    </div>
  );
}
