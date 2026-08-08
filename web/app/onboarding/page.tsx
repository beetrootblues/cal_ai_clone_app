"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Users } from "@/lib/phpApi";
import styles from "./Onboarding.module.css";

const STEPS = 4;

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form state
  const [gender, setGender] = useState("male");
  const [ageYears, setAgeYears] = useState("30");
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("70");
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [goal, setGoal] = useState("maintain");
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // If already onboarded, redirect
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user?.onboarded) router.replace("/dashboard");
  }, [user, loading, router]);

  if (loading || !user || user.onboarded) return null;

  function clampInt(value: string, min: number, max: number, fallback: number): number {
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  async function handleFinish() {
    setSubmitError("");
    setSubmitting(true);
    try {
      await Users.completeOnboarding(Number(user!.id), {
        gender,
        ageYears: clampInt(ageYears, 13, 100, 30),
        heightCm: clampInt(heightCm, 100, 250, 175),
        weightKg: clampInt(weightKg, 30, 300, 70),
        activityLevel,
        goal,
      });
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (step < STEPS) setStep(s => s + 1);
    else handleFinish();
  }

  function handleBack() {
    if (step > 1) setStep(s => s - 1);
  }

  const progressPct = ((step - 1) / STEPS) * 100 + (100 / STEPS);

  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.card}>
        
        {/* Progress Bar with Steps */}
        <div className={styles.progressWrap}>
          <div className={styles.progressBar} style={{ width: `${progressPct}%` }} />
        </div>
        
        <div className={styles.stepperDots}>
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`${styles.dot} ${step >= s ? styles.dotActive : ""}`}
            />
          ))}
        </div>

        {/* Dynamic Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            {step === 1 && "What's your biological sex?"}
            {step === 2 && "Let's get your metrics."}
            {step === 3 && "How active are you?"}
            {step === 4 && "What is your main goal?"}
          </h1>
          <p className={styles.subtitle}>
            {step === 1 && "This helps us calculate your basal metabolic rate accurately."}
            {step === 2 && "Used to tailor your daily macronutrient and calorie targets."}
            {step === 3 && "Include your daily life movement and exercise routine."}
            {step === 4 && "Choose what you want to achieve. FitBot will adapt to this."}
          </p>
        </div>

        {/* Step 1: Gender */}
        {step === 1 && (
          <div className={styles.stepContainer}>
            <div className={styles.optionsGridRow}>
              <button type="button" aria-pressed={gender === "male"}
                className={`${styles.choiceCard} ${styles.choiceCardCol} ${gender === "male" ? styles.choiceCardActive : ""}`}
                onClick={() => { setGender("male"); handleNext(); }}
              >
                <div className={styles.choiceIconWrapper}>
                  <span className={`material-symbols-outlined ${styles.choiceIcon}`}>man</span>
                </div>
                <span className={styles.choiceLabel}>Male</span>
              </button>
              <button type="button" aria-pressed={gender === "female"}
                className={`${styles.choiceCard} ${styles.choiceCardCol} ${gender === "female" ? styles.choiceCardActive : ""}`}
                onClick={() => { setGender("female"); handleNext(); }}
              >
                <div className={styles.choiceIconWrapper}>
                  <span className={`material-symbols-outlined ${styles.choiceIcon}`}>woman</span>
                </div>
                <span className={styles.choiceLabel}>Female</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Metrics */}
        {step === 2 && (
          <div className={styles.stepContainer}>
            <div className={styles.statsGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="onb-age">Age</label>
                <div className={styles.inputWrap}>
                  <span className={`material-symbols-outlined ${styles.inputIcon}`}>calendar_today</span>
                  <input id="onb-age" type="number" min="13" max="100" className={styles.input} value={ageYears} onChange={e => setAgeYears(e.target.value)} autoFocus placeholder="30" />
                  <span className={styles.inputUnit}>years</span>
                </div>
              </div>
              <div className={styles.statsRow}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="onb-height">Height</label>
                  <div className={styles.inputWrap}>
                    <span className={`material-symbols-outlined ${styles.inputIcon}`}>height</span>
                    <input id="onb-height" type="number" min="100" max="250" className={styles.input} value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="175" />
                    <span className={styles.inputUnit}>cm</span>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="onb-weight">Weight</label>
                  <div className={styles.inputWrap}>
                    <span className={`material-symbols-outlined ${styles.inputIcon}`}>monitor_weight</span>
                    <input id="onb-weight" type="number" min="30" max="300" className={styles.input} value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="70" />
                    <span className={styles.inputUnit}>kg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Activity Level */}
        {step === 3 && (
          <div className={styles.stepContainer}>
            <div className={styles.optionsGrid}>
              {[
                { id: "sedentary", icon: "chair",            label: "Sedentary", sub: "Desk job, little to no exercise" },
                { id: "light",     icon: "directions_walk",  label: "Lightly Active", sub: "Light exercise 1-3 days/week" },
                { id: "moderate",  icon: "fitness_center",   label: "Moderately Active", sub: "Moderate exercise 3-5 days/week" },
                { id: "active",    icon: "directions_run",   label: "Very Active", sub: "Hard exercise 6-7 days/week" },
              ].map(opt => (
                <button key={opt.id} type="button" aria-pressed={activityLevel === opt.id}
                  className={`${styles.choiceCard} ${activityLevel === opt.id ? styles.choiceCardActive : ""}`}
                  onClick={() => setActivityLevel(opt.id)}
                >
                  <div className={styles.choiceIconWrapperSmall}>
                    <span className={`material-symbols-outlined ${styles.choiceIcon}`}>{opt.icon}</span>
                  </div>
                  <div className={styles.choiceContent}>
                    <span className={styles.choiceLabel}>{opt.label}</span>
                    <span className={styles.choiceSub}>{opt.sub}</span>
                  </div>
                  {activityLevel === opt.id && <span className={`material-symbols-outlined ${styles.checkIcon}`}>check_circle</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Goal */}
        {step === 4 && (
          <div className={styles.stepContainer}>
            <div className={styles.optionsGrid}>
              {[
                { id: "lose",     icon: "trending_down",   label: "Lose Weight",     sub: "Caloric deficit (-500 kcal/day)" },
                { id: "maintain", icon: "trending_flat",   label: "Maintain Weight", sub: "Maintenance calories" },
                { id: "gain",     icon: "trending_up",     label: "Build Muscle",    sub: "Caloric surplus (+500 kcal/day)" },
              ].map(opt => (
                <button key={opt.id} type="button" aria-pressed={goal === opt.id}
                  className={`${styles.choiceCard} ${goal === opt.id ? styles.choiceCardActive : ""}`}
                  onClick={() => setGoal(opt.id)}
                >
                  <div className={styles.choiceIconWrapperSmall}>
                    <span className={`material-symbols-outlined ${styles.choiceIcon}`}>{opt.icon}</span>
                  </div>
                  <div className={styles.choiceContent}>
                    <span className={styles.choiceLabel}>{opt.label}</span>
                    <span className={styles.choiceSub}>{opt.sub}</span>
                  </div>
                  {goal === opt.id && <span className={`material-symbols-outlined ${styles.checkIcon}`}>check_circle</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {submitError && (
          <div className={styles.onboardError} role="alert">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
            {submitError}
          </div>
        )}

        {/* Footer actions */}
        <div className={styles.footer}>
          {step > 1 && (
            <button className={styles.btnBack} onClick={handleBack} disabled={submitting} aria-label="Go back">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
              <span className={styles.btnBackLabel}>Back</span>
            </button>
          )}
          <button className={styles.btnNext} onClick={handleNext} disabled={submitting || (step === 2 && (!ageYears || !heightCm || !weightKg))} aria-label={step === STEPS ? "Finish onboarding" : "Continue to next step"}>
            {submitting ? <span className={styles.spinner} /> : (
              <>
                <span>{step === STEPS ? "Finish" : "Continue"}</span>
                {step !== STEPS && <span className="material-symbols-outlined">arrow_forward</span>}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
