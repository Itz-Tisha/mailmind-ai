import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  PieController,
} from 'chart.js';
import { useTheme } from '../contexts/ThemeContext';

// Register pie chart controller & elements
ChartJS.register(PieController, ArcElement, Tooltip, Legend);

//const BACKEND_URL = 'http://localhost:5000';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const BRAND_NAME = 'SmartInbox';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [moodData, setMoodData] = useState(null);
  const { theme, toggleTheme } = useTheme();

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await axios.get(
          `${BACKEND_URL}/user/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUser(userRes.data);

        const emailRes = await axios.get(
          `${BACKEND_URL}/gmail/emails`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const emails = Array.isArray(emailRes.data.emails)
          ? emailRes.data.emails
          : [];

        const limitedEmails = emails.slice(0, 10).map(mail => ({
          subject: mail.subject || '',
          body: (mail.snippet || '').substring(0, 150),
        }));

        const moodRes = await axios.post(
          `${BACKEND_URL}/ai-mood/daily`,
          { emails: limitedEmails },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMoodData(moodRes.data);

      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  // Build / update the pie chart when moodData is available
  useEffect(() => {
    if (!moodData || !chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'pie',
      data: {
        labels: ['Happy', 'Sad', 'Neutral'],
        datasets: [
          {
            data: [moodData.happy, moodData.sad, moodData.neutral],
            backgroundColor: ['#22c55e', '#ef4444', '#6366f1'],
            borderColor: '#0f172a',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: theme === 'dark' ? '#e5e7eb' : '#111827',
              font: { size: 12 },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.parsed}%`,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [moodData, theme]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
            : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          color: theme === 'dark' ? '#e5e7eb' : '#111827',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        Loading profile...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        transition: 'background 0.5s ease',
      }}
    >
      {/* Top Navigation Bar */}
      <div
        style={{
          background: theme === 'dark'
            ? 'rgba(26,26,46,0.85)'
            : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: theme === 'dark'
            ? '0 4px 20px rgba(0,0,0,0.4)'
            : '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '20px',
              color: '#ffffff',
              boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
            }}
          >
            SI
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 700,
                color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
              }}
            >
              {`${BRAND_NAME} · Profile`}
            </h1>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '12px',
                color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
              }}
            >
              {user?.email}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => window.location.href = '/home'}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
              background: theme === 'dark'
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(255,255,255,0.85)',
              color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span>🏠</span>
            <span>Home</span>
          </button>

          <button
            onClick={toggleTheme}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
              background: theme === 'dark'
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(255,255,255,0.85)',
              color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 15px rgba(239,68,68,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(239,68,68,0.3)';
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
            gap: '24px',
            alignItems: 'stretch',
          }}
        >
          {/* Profile Card */}
          <div
            style={{
              background: theme === 'dark'
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.9)',
              borderRadius: '20px',
              padding: '24px 28px',
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)'}`,
              boxShadow: theme === 'dark'
                ? '0 10px 30px rgba(15,23,42,0.7)'
                : '0 10px 30px rgba(15,23,42,0.12)',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: theme === 'dark' ? '#ffffff' : '#0f172a',
                marginBottom: '16px',
              }}
            >
              Account Overview
            </h2>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #22c55e, #0ea5e9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'P'}
              </div>

              <div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: theme === 'dark' ? '#e5e7eb' : '#0f172a',
                    marginBottom: '4px',
                  }}
                >
                  {user.name || 'User'}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: theme === 'dark' ? 'rgba(249,250,251,0.6)' : 'rgba(15,23,42,0.7)',
                  }}
                >
                  {user.email}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: '14px',
                background: theme === 'dark'
                  ? 'rgba(15,23,42,0.9)'
                  : 'rgba(239,246,255,0.95)',
                border: `1px solid ${theme === 'dark' ? 'rgba(148,163,184,0.35)' : 'rgba(59,130,246,0.25)'}`,
                fontSize: '13px',
                color: theme === 'dark' ? 'rgba(226,232,240,0.9)' : '#0f172a',
                lineHeight: 1.7,
              }}
            >
              <strong style={{ display: 'block', marginBottom: 4 }}>
                Mail Mental Health Insight
              </strong>
              {moodData ? (
                <span>
                  Your recent inbox suggests an overall mood of{' '}
                  <strong>{moodData.userMood}</strong>. This is based on the
                  last 10 emails analyzed.
                </span>
              ) : (
                <span>
                  We&apos;ll analyze a sample of your recent emails to estimate
                  your communication mood.
                </span>
              )}
            </div>
          </div>

          {/* Mood Pie Chart Card */}
          <div
            style={{
              background: theme === 'dark'
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.9)',
              borderRadius: '20px',
              padding: '24px 24px 18px',
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)'}`,
              boxShadow: theme === 'dark'
                ? '0 10px 30px rgba(15,23,42,0.7)'
                : '0 10px 30px rgba(15,23,42,0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: theme === 'dark' ? '#ffffff' : '#0f172a',
              }}
            >
              Inbox Mood Breakdown
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                color: theme === 'dark' ? 'rgba(226,232,240,0.65)' : 'rgba(15,23,42,0.65)',
              }}
            >
              Based on the emotional tone of your recent emails (happy, sad, neutral).
            </p>

            {moodData ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  marginTop: '8px',
                  flex: 1,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <canvas ref={chartRef} />
                </div>

                <div
                  style={{
                    minWidth: 130,
                    fontSize: '13px',
                    color: theme === 'dark' ? 'rgba(226,232,240,0.9)' : '#0f172a',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 10,
                          height: 10,
                          borderRadius: '999px',
                          background: '#22c55e',
                          marginRight: 6,
                        }}
                      />
                      Happy
                    </span>
                    <span>{moodData.happy}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 10,
                          height: 10,
                          borderRadius: '999px',
                          background: '#ef4444',
                          marginRight: 6,
                        }}
                      />
                      Sad
                    </span>
                    <span>{moodData.sad}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 10,
                          height: 10,
                          borderRadius: '999px',
                          background: '#6366f1',
                          marginRight: 6,
                        }}
                      />
                      Neutral
                    </span>
                    <span>{moodData.neutral}%</span>
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: `1px dashed ${theme === 'dark' ? 'rgba(148,163,184,0.5)' : 'rgba(148,163,184,0.7)'}`,
                      fontSize: '12px',
                    }}
                  >
                    Overall mood:{' '}
                    <strong style={{ textTransform: 'capitalize' }}>{moodData.userMood}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  marginTop: '16px',
                  fontSize: '13px',
                  color: theme === 'dark' ? 'rgba(148,163,184,0.9)' : 'rgba(100,116,139,0.9)',
                }}
              >
                We are analyzing a sample of your recent emails to understand the emotional tone of your inbox.
                Come back in a moment to see your mood breakdown.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;



