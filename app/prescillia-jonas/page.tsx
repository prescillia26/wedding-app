'use client';

import React, { useState, useRef, useEffect, useCallback, CSSProperties, FormEvent } from 'react';

/* ──────────────────────── constants ──────────────────────── */

const VIDEO_URL =
  'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/user-videos/envelope-prescillia-jonas-v5-tfU37V7qjwIijp8KFT4uTMO98FOjj8.mp4';
const MUSIC_URL =
  'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/%D7%90%D7%91%D7%99%20%D7%93%D7%9C%D7%91%D7%A0%D7%98%D7%99%20-%20%D7%91%D7%A8%D7%90%D7%A9%D7%99%D7%AA%20%D7%A2%D7%95%D7%9C%D7%9D%20%D7%A7%D7%9C%D7%99%D7%A4%20%20Avi%20Delevanti%20-%20Bereshit%20Olam%20Wedding%20Clip-INVlzvA2z4oUrtalPZjizy4CnUh9I6.mp3';
const ILLUSTRATION_URL =
  'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/ChatGPT%20Image%2029%20juin%202026%20%C3%A0%2014_46_12-UDRvf4dn3NpD94DdaDAxW8TtDBJrEl.png';
const LOGO_URL =
  'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/logos/logo-1782918779611.png';
const MAIRIE_IMG =
  'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/mairie-cropped-K64299soiLkKjGpZGPv0p58a0qR0PN.png';
const HENNE_IMG =
  'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/henne-illustration-prescillia-v3-B4eVhbBkh64jeKXoxDmz2Ta8XbBtJM.png';
const HOUPPA_IMG =
  'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/houppa-cropped-YtRO161x8ObdFXf0HNFri5JjmFa1Tx.png';
const SHABBAT_IMG =
  'https://gsihevihnthjsm8z.public.blob.vercel-storage.com/illustrations/shabbat-jerusalem-1sayxWJMSXbdmj4sr0HHdDYVEXlCz9.png';

const SHARE_ID = '7a64180f-7bdd-4f7a-a702-f78858f400fe';
const NAVY = '#1B2A5E';
const GOLD = '#C9A264';
const IVORY = '#F7F3EC';
const BG_DEFAULT = '#FAF7F0';
const BG_BLUE = '#EBF2FA';
const TEXT_BROWN = '#6B5A42';

const FIRST_CEREMONY_DATE = new Date('2026-10-21T14:30:00');

/* ──────────────────────── keyframes (injected once) ──────────────────────── */

const KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.04); }
}
`;

/* ──────────────────────── helpers ──────────────────────── */

function useCountdown(target: Date) {
  const calc = useCallback(() => {
    const diff = Math.max(0, target.getTime() - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s };
  }, [target]);
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return t;
}

const anim = (name: string, duration: string, delay: string): CSSProperties => ({
  opacity: 0,
  animation: `${name} ${duration} ease-out ${delay} forwards`,
});

/* ──────────────────────── sub-components ──────────────────────── */

function PJWatermark() {
  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 0, userSelect: 'none' }}>
      <svg width="300" height="200" viewBox="0 0 300 200">
        <text x="150" y="170" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontSize="210" fill="rgba(27,42,94,0.07)">PJ</text>
      </svg>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{ position: 'relative', textAlign: 'center', padding: '24px 0 12px' }}>
      <PJWatermark />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '42px', color: NAVY }}>{title}</span>
      </div>
    </div>
  );
}

function NamesBlock() {
  return (
    <div style={{ textAlign: 'center', margin: '10px 0' }}>
      <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: '36px', color: NAVY }}>Prescillia</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '22px', color: GOLD, margin: '2px 0' }}>&amp;</div>
      <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: '36px', color: NAVY }}>Jonas</div>
    </div>
  );
}

function ElegantSeparator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
      <svg width="260" height="28" viewBox="0 0 260 28">
        <line x1="0" y1="14" x2="90" y2="14" stroke={GOLD} strokeWidth="0.7" />
        <circle cx="100" cy="14" r="3" fill="none" stroke={GOLD} strokeWidth="0.7" />
        <path d="M110 14 Q115 4 130 14 Q115 24 110 14Z" fill="none" stroke={GOLD} strokeWidth="0.7" />
        <circle cx="160" cy="14" r="3" fill="none" stroke={GOLD} strokeWidth="0.7" />
        <line x1="170" y1="14" x2="260" y2="14" stroke={GOLD} strokeWidth="0.7" />
      </svg>
    </div>
  );
}

/* ──────────────────────── RSVP form ──────────────────────── */

function RsvpSection() {
  const [name, setName] = useState('');
  const [guests, setGuests] = useState('1');
  const [attendance, setAttendance] = useState<'present' | 'absent' | null>(null);
  const [events, setEvents] = useState<Record<string, boolean>>({
    mairie: false,
    henne: false,
    houppa: false,
    shabbat: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const toggleEvent = (key: string) => setEvents(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !attendance) return;
    setSending(true);
    try {
      await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareId: SHARE_ID,
          name,
          guests: Number(guests),
          attendance,
          events,
        }),
      });
      setSubmitted(true);
    } catch {
      /* silently fail */
    } finally {
      setSending(false);
    }
  };

  const checkboxStyle: CSSProperties = {
    width: 18, height: 18, accentColor: GOLD, cursor: 'pointer',
  };
  const labelStyle: CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', color: NAVY, cursor: 'pointer',
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: NAVY }}>
        <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: '38px', color: '#fff' }}>Merci !</div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", color: 'rgba(255,255,255,0.8)', fontSize: '17px', marginTop: 12 }}>Votre réponse a bien été envoyée.</p>
      </div>
    );
  }

  return (
    <div style={{ background: NAVY, padding: '50px 20px 60px', textAlign: 'center' }}>
      {/* rings svg */}
      <svg width="60" height="40" viewBox="0 0 60 40" style={{ marginBottom: 8 }}>
        <circle cx="22" cy="20" r="14" fill="none" stroke={GOLD} strokeWidth="1.2" />
        <circle cx="38" cy="20" r="14" fill="none" stroke={GOLD} strokeWidth="1.2" />
      </svg>
      <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: '42px', color: '#fff' }}>Rsvp</div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', color: 'rgba(255,255,255,0.7)', margin: '6px 0 28px' }}>Merci de confirmer votre présence</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: 420, margin: '0 auto', textAlign: 'left' }}>
        {/* Event checkboxes */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Événements</div>
          {[
            ['mairie', 'Mairie'],
            ['henne', 'Henné'],
            ['houppa', 'Houppa'],
            ['shabbat', 'Shabbat Hatan'],
          ].map(([key, label]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={events[key]} onChange={() => toggleEvent(key)} style={checkboxStyle} />
              <span style={{ ...labelStyle, color: '#fff' }}>{label}</span>
            </label>
          ))}
        </div>

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Votre nom"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{
              width: '100%', padding: '12px 14px', border: `1px solid ${GOLD}`, borderRadius: 6,
              background: 'rgba(255,255,255,0.08)', color: '#fff', fontFamily: "'Cormorant Garamond', serif", fontSize: '16px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Guests */}
        <div style={{ marginBottom: 22 }}>
          <input
            type="number"
            min="1"
            max="20"
            value={guests}
            onChange={e => setGuests(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', border: `1px solid ${GOLD}`, borderRadius: 6,
              background: 'rgba(255,255,255,0.08)', color: '#fff', fontFamily: "'Cormorant Garamond', serif", fontSize: '16px',
              outline: 'none', boxSizing: 'border-box',
            }}
            placeholder="Nombre d'invités"
          />
        </div>

        {/* Attendance buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => setAttendance('present')}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 6, cursor: 'pointer', fontFamily: "'Cormorant Garamond', serif",
              fontSize: '15px', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', transition: 'all 0.2s',
              background: attendance === 'present' ? GOLD : 'transparent',
              color: attendance === 'present' ? NAVY : '#fff',
              border: `1.5px solid ${GOLD}`,
            }}
          >
            Présent
          </button>
          <button
            type="button"
            onClick={() => setAttendance('absent')}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 6, cursor: 'pointer', fontFamily: "'Cormorant Garamond', serif",
              fontSize: '15px', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', transition: 'all 0.2s',
              background: attendance === 'absent' ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: '#fff',
              border: `1.5px solid rgba(255,255,255,0.3)`,
            }}
          >
            Absent
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={sending}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 6, cursor: 'pointer', fontFamily: "'Cormorant Garamond', serif",
            fontSize: '15px', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase',
            background: GOLD, color: '#fff', border: 'none', transition: 'opacity 0.2s',
            opacity: sending ? 0.6 : 1,
          }}
        >
          {sending ? '...' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
}

/* ──────────────────────── Navbar ──────────────────────── */

function Navbar() {
  const { d, h, m, s } = useCountdown(FIRST_CEREMONY_DATE);
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(247,243,236,0.95)', backdropFilter: 'blur(8px)',
        borderBottom: `0.5px solid ${GOLD}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', height: 52,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_URL} alt="Lov'it" style={{ height: 32 }} />
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', color: NAVY, letterSpacing: 1 }}>
          {d}j {h}h {m}m {s}s
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="4" y1="6" x2="20" y2="6" stroke={NAVY} strokeWidth="1.5" />
            <line x1="4" y1="12" x2="20" y2="12" stroke={NAVY} strokeWidth="1.5" />
            <line x1="4" y1="18" x2="20" y2="18" stroke={NAVY} strokeWidth="1.5" />
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div style={{
          position: 'fixed', top: 52, right: 0, zIndex: 999,
          background: 'rgba(247,243,236,0.97)', backdropFilter: 'blur(8px)',
          borderLeft: `0.5px solid ${GOLD}33`, borderBottom: `0.5px solid ${GOLD}33`,
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          {[
            ['mairie', 'Mairie'],
            ['henne', 'Henné'],
            ['houppa', 'Houppa'],
            ['shabbat', 'Shabbat Hatan'],
            ['rsvp', 'RSVP'],
          ].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', color: NAVY,
            }}>
              {label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* ──────────────────────── Main Page ──────────────────────── */

export default function PrescilliaJonasPage() {
  const [phase, setPhase] = useState<'video' | 'invitation'>('video');
  const [showButton, setShowButton] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const firstCeremonyRef = useRef<HTMLDivElement>(null);

  /* load video and show first frame */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    v.pause();
    v.currentTime = 0;
  }, []);

  const handleDiscover = () => {
    setShowButton(false);
    const v = videoRef.current;
    const a = audioRef.current;
    if (v) {
      v.play().catch(() => {});
      v.onended = () => setPhase('invitation');
    }
    if (a) {
      a.play().catch(() => {});
    }
  };

  const scrollToFirst = () => {
    firstCeremonyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /* ── shared styles ── */
  const sectionBase: CSSProperties = {
    padding: '40px 20px 48px', textAlign: 'center',
  };
  const dateStyle: CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: NAVY, fontWeight: 600, margin: '14px 0 4px',
  };
  const addressStyle: CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', color: TEXT_BROWN, fontStyle: 'italic',
  };
  const imgStyle: CSSProperties = {
    width: '85%', maxWidth: 360, borderRadius: 12, margin: '16px auto', display: 'block',
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <audio ref={audioRef} id="lovit-audio" src={MUSIC_URL} loop preload="auto" />

      {/* ════════════ VIDEO PHASE ════════════ */}
      {phase === 'video' && (
        <div style={{ position: 'fixed', inset: 0, background: IVORY, zIndex: 2000 }}>
          <video
            ref={videoRef}
            playsInline
            muted
            preload="auto"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          >
            <source src={VIDEO_URL} type="video/mp4" />
          </video>
          {showButton && (
            <button
              onClick={handleDiscover}
              style={{
                position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(247,243,236,0.88)', color: NAVY, border: `0.5px solid ${GOLD}`,
                fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', fontWeight: 600,
                letterSpacing: 2, textTransform: 'uppercase', padding: '14px 32px', borderRadius: 6,
                cursor: 'pointer', animation: 'pulse 2.2s ease-in-out infinite', whiteSpace: 'nowrap',
              }}
            >
              {'D\u00c9COUVRIR VOTRE FAIRE-PART \u25c6'}
            </button>
          )}
        </div>
      )}

      {/* ════════════ INVITATION PHASE ════════════ */}
      {phase === 'invitation' && (
        <div style={{ background: BG_DEFAULT, minHeight: '100vh' }}>
          <Navbar />

          {/* ──── ACCUEIL ──── */}
          <section style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: IVORY, padding: '60px 20px 40px', textAlign: 'center', position: 'relative',
          }}>
            <div style={anim('fadeSlideUp', '0.7s', '0.1s')}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: NAVY }}>&#x5D1;&#x5E1;&#x5F4;&#x5D3;</span>
            </div>
            <div style={anim('fadeSlideUp', '0.9s', '0.3s')}>
              <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '58px', color: NAVY, lineHeight: 1.2 }}>Prescillia</span>
            </div>
            <div style={anim('fadeSlideUp', '0.7s', '0.55s')}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '28px', color: GOLD }}>&amp;</span>
            </div>
            <div style={anim('fadeSlideUp', '0.9s', '0.7s')}>
              <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '58px', color: NAVY, lineHeight: 1.2 }}>Jonas</span>
            </div>
            <div style={anim('fadeSlideUp', '0.7s', '0.95s')}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '17px', color: TEXT_BROWN, margin: '14px 0 0', maxWidth: 340 }}>
                ont le plaisir de vous convier&nbsp;à&nbsp;leur&nbsp;mariage
              </p>
            </div>
            <div style={anim('fadeIn', '1.4s', '1.1s')}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ILLUSTRATION_URL} alt="Illustration" style={{ width: '75%', maxWidth: 320, margin: '24px auto 0', display: 'block', borderRadius: 12 }} />
            </div>
            <div style={anim('fadeSlideUp', '0.7s', '1.7s')}>
              <button
                onClick={scrollToFirst}
                style={{
                  marginTop: 28, background: 'transparent', border: `1px solid ${GOLD}`, color: NAVY,
                  fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', fontWeight: 600,
                  letterSpacing: 2, textTransform: 'uppercase', padding: '12px 28px', borderRadius: 6, cursor: 'pointer',
                }}
              >
                {'D\u00c9COUVRIR \u25c6'}
              </button>
            </div>
            <div style={anim('fadeIn', '0.7s', '2.0s')}>
              <div style={{ marginTop: 28, fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', color: TEXT_BROWN, lineHeight: 1.8 }}>
                21 Octobre 2026 &middot; 22 Octobre 2026<br />
                11 Novembre 2026
              </div>
            </div>
          </section>

          {/* ──── MAIRIE ──── */}
          <div ref={firstCeremonyRef} id="mairie" style={{ ...sectionBase, background: BG_BLUE }}>
            <SectionTitle title="Mairie" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MAIRIE_IMG} alt="Mairie" style={imgStyle} />
            <NamesBlock />
            <div style={dateStyle}>Mercredi 21 Octobre 2026 &middot; 14h30</div>
            <div style={addressStyle}>Mairie du 16&egrave;me</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', color: TEXT_BROWN, fontStyle: 'italic', marginTop: 18 }}>
              Sera suivie de
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', color: TEXT_BROWN, fontStyle: 'italic' }}>
              Un vin d&apos;honneur suivra la mairie
            </div>
          </div>

          <ElegantSeparator />

          {/* ──── HENNE ──── */}
          <div id="henne" style={{ ...sectionBase, background: BG_DEFAULT }}>
            <SectionTitle title="Henn\u00e9" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HENNE_IMG} alt="Henn\u00e9" style={imgStyle} />
            <NamesBlock />
            <div style={dateStyle}>Jeudi 22 Octobre 2026 &middot; 18h00</div>
            <div style={addressStyle}>Salon Hoche</div>
          </div>

          <ElegantSeparator />

          {/* ──── HOUPPA ──── */}
          <div id="houppa" style={{ ...sectionBase, background: BG_BLUE }}>
            <SectionTitle title="Houppa" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HOUPPA_IMG} alt="Houppa" style={imgStyle} />

            {/* Parents / GP section */}
            <div style={{ maxWidth: 400, margin: '24px auto', textAlign: 'center' }}>
              {/* Grands-parents */}
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', color: GOLD, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>
                Nos grands-parents
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', color: NAVY }}>M. &amp; Mme Sydney Zeitoun</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', color: NAVY, marginTop: 4 }}>Mme Janine Benjamin</div>
                </div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', color: NAVY }}>Mme Simone Hayon</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', color: NAVY, marginTop: 4 }}>Mme Rachel Benaim</div>
                </div>
              </div>

              {/* Separator line */}
              <div style={{ width: 60, height: 1, background: GOLD, margin: '16px auto', opacity: 0.5 }} />

              {/* Parents */}
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', color: GOLD, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14, marginTop: 16 }}>
                Nos parents
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: 20 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', color: NAVY }}>M. &amp; Mme St&eacute;phane Zeitoun</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', color: NAVY }}>M. &amp; Mme Joseph Ohayon</div>
              </div>

              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', color: TEXT_BROWN, fontStyle: 'italic', margin: '20px 0 8px' }}>
                ont la joie de vous faire part du mariage de
              </p>
            </div>

            <NamesBlock />

            {/* Hebrew names */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', margin: '6px 0 16px', direction: 'rtl' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: GOLD, fontStyle: 'italic' }}>&#x5E4;&#x5E8;&#x5E1;&#x5D9;&#x5DC;&#x5D9;&#x5D4;</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: GOLD, fontStyle: 'italic' }}>&#x5D9;&#x5D5;&#x5E0;&#x5E1;</span>
            </div>

            <div style={dateStyle}>Mercredi 11 Novembre 2026 &middot; 15h30</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', color: TEXT_BROWN, fontStyle: 'italic', margin: '2px 0 4px' }}>
              17 Heshvan 5787
            </div>
            <div style={addressStyle}>Trask Tel Aviv</div>

            {/* Pens\u00e9es pour nos d\u00e9funts */}
            <div style={{ marginTop: 36, padding: '20px', borderTop: `0.5px solid ${GOLD}33`, maxWidth: 360, margin: '36px auto 0' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', color: GOLD, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
                Pens&eacute;es pour nos d&eacute;funts
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', color: NAVY, lineHeight: 2 }}>
                Lionel Benjamin &#x5D6;&quot;&#x5DC;<br />
                Leon Ohayon &#x5D6;&quot;&#x5DC;<br />
                Charles Benaim &#x5D6;&quot;&#x5DC;
              </div>
            </div>
          </div>

          <ElegantSeparator />

          {/* ──── SHABBAT HATAN ──── */}
          <div id="shabbat" style={{ ...sectionBase, background: BG_DEFAULT }}>
            <SectionTitle title="Shabbat Hatan" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SHABBAT_IMG} alt="Shabbat Hatan" style={imgStyle} />

            {/* Paracha */}
            <div style={{ maxWidth: 340, margin: '18px auto 20px', padding: '16px 20px', border: `0.5px solid ${GOLD}44`, borderRadius: 10, background: 'rgba(255,255,255,0.5)' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', color: GOLD, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
                Paracha Vayera
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', color: TEXT_BROWN, lineHeight: 1.8 }}>
                Allumage des bougies : 16h42<br />
                Sortie de Shabbat : 17h58
              </div>
            </div>

            <NamesBlock />

            <div style={dateStyle}>Bet Shmuel, J&eacute;rusalem</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', color: TEXT_BROWN, marginTop: 10, lineHeight: 1.8 }}>
              Vendredi soir 19h<br />
              Samedi midi 12h30
            </div>
          </div>

          <ElegantSeparator />

          {/* ──── RSVP ──── */}
          <div id="rsvp">
            <RsvpSection />
          </div>

          {/* ──── FOOTER ──── */}
          <footer style={{ textAlign: 'center', padding: '28px 20px 36px', background: BG_DEFAULT }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', color: TEXT_BROWN }}>
              cr&eacute;&eacute; avec &hearts; par Lov&apos;it
            </span>
          </footer>
        </div>
      )}
    </>
  );
}
