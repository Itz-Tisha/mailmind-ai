// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useTheme } from '../contexts/ThemeContext';
// import '../assets/Compose.css';
// import '../assets/Home.css';

// const BACKEND_URL = 'http://localhost:5000';

// export default function Compose() {
//   const { theme, toggleTheme } = useTheme();
//   const [user, setUser] = useState(null);
//   const [to, setTo] = useState("");
//   const [subject, setSubject] = useState("");
//   const [description, setDescription] = useState("");
//   const [draft, setDraft] = useState("");

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       window.location.href = '/login';
//       return;
//     }

//     axios
//       .get(`${BACKEND_URL}/user/me`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then(res => setUser(res.data))
//       .catch(err => {
//         console.error(err);
//         if (err.response?.status === 401) {
//           localStorage.removeItem('token');
//           window.location.href = '/login';
//         }
//       });
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     window.location.href = '/login';
//   };

//   const generate = async () => {
//     const res = await axios.post("http://localhost:5000/api/compose/generate", {
//       userId: "123",
//       to,
//       subject,
//       description
//     });

//     setDraft(res.data.draft);
//   };

//   const save = async () => {
//     await axios.post(
//       "http://localhost:5000/api/compose/save",
//       {
//         userId: "123",
//         to,
//         subject,
//         draft
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`
//         }
//       }
//     );

//     alert("Saved to Gmail!");
//     setDraft("");
//   };

//   return (
//     <div className="homePage">
//       {/* Top Navigation Bar */}
//       <div className="homeTopbar">
//         <div className="homeBrand">
//           <div className="homeBrandLogo">PC</div>
//           <div>
//             <h1 className="homeBrandTitle">Productivity Copilot</h1>
//             <p className="homeBrandSubtitle">{user?.email || 'Loading...'}</p>
//           </div>
//         </div>

//         <div className="homeActions">
//           <button onClick={() => window.location.href = '/home'} className="homeBtn">
//             <span>🏠</span>
//             <span>Home</span>
//           </button>

//           <button onClick={toggleTheme} className="homeBtn">
//             <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
//             <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
//           </button>

//           <button onClick={() => window.location.href = '/profile'} className="homeBtn">
//             <span className="homeProfileBadge">
//               {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
//             </span>
//             <span>Profile</span>
//           </button>

//           <button onClick={handleLogout} className="homeLogoutBtn">
//             Logout
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="homeMain">
//         <div className="composeCard">
//         <div className="composeField">
//           <input
//             className="composeInput"
//             placeholder="To"
//             onChange={e => setTo(e.target.value)}
//           />
//         </div>

//         <div className="composeField">
//           <input
//             className="composeInput"
//             placeholder="Subject"
//             onChange={e => setSubject(e.target.value)}
//           />
//         </div>

//         <div className="composeField">
//           <textarea
//             className="composeTextarea"
//             placeholder="Description"
//             onChange={e => setDescription(e.target.value)}
//           />
//         </div>

//         <button className="composePrimaryBtn" onClick={generate}>
//           Generate Draft
//         </button>

//         {draft && (
//           <div className="composeDraftWrap">
//             <pre className="composeDraft">{draft}</pre>

//             <div className="composeDraftActions">
//               <button className="composeActionBtn composeSaveBtn" onClick={save}>
//                 Save Draft
//               </button>
//               <button
//                 className="composeActionBtn composeDiscardBtn"
//                 onClick={() => setDraft("")}
//               >
//                 Discard
//               </button>
//             </div>
//           </div>
//         )}
//         </div>
//       </div>
//     </div>
//   );
// }





import { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from '../contexts/ThemeContext';
import '../assets/Compose.css';

const BACKEND_URL = 'http://localhost:5000';

export default function Compose() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [draft, setDraft] = useState("");
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  // Show notification helper function
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 4000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    axios
      .get(`${BACKEND_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setUser(res.data))
      .catch(err => {
        console.error(err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

 const generate = async () => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/compose/generate",
      {
        to,
        subject,
        description
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    setDraft(res.data.draft);
  } catch (err) {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else {
      console.error(err);
      showNotification("Failed to generate email draft. Please check your inputs and try again.", 'error');
    }
  }
};
  const save = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/compose/save",
        {
          to,
          subject,
          draft
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      showNotification("Email draft saved successfully to Gmail!", 'success');
      setDraft("");
      setTo("");
      setSubject("");
      setDescription("");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        showNotification("Failed to save draft to Gmail. Please try again.", 'error');
      }
    }
  };

  return (
    <div className="composePage">
      {/* Notification Toast */}
      {notification.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            minWidth: '300px',
            maxWidth: '500px',
            padding: '16px 20px',
            borderRadius: '12px',
            background: notification.type === 'success'
              ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              : notification.type === 'error'
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#ffffff',
            boxShadow: theme === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.5)'
              : '0 8px 32px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'slideIn 0.3s ease-out',
            cursor: 'pointer',
          }}
          onClick={() => setNotification({ show: false, message: '', type: 'info' })}
        >
          <div style={{ fontSize: '20px' }}>
            {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}
          </div>
          <div style={{ flex: 1, fontSize: '14px', fontWeight: 500, lineHeight: 1.5 }}>
            {notification.message}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setNotification({ show: false, message: '', type: 'info' });
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#ffffff',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
          >
            ×
          </button>
        </div>
      )}
      {/* Top Navigation Bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: theme === 'dark'
            ? 'rgba(26,26,46,0.8)'
            : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
          boxShadow: theme === 'dark'
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.1)',
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
            PC
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
              Compose Email
            </h1>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '12px',
                color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
              }}
            >
              {user?.email || 'Loading...'}
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
                : 'rgba(255,255,255,0.8)',
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
                : 'rgba(255,255,255,0.8)',
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
              e.currentTarget.style.background = theme === 'dark'
                ? 'rgba(255,255,255,0.15)'
                : 'rgba(255,255,255,1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = theme === 'dark'
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(255,255,255,0.8)';
            }}
          >
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <button
            onClick={() => window.location.href = '/profile'}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
              background: theme === 'dark'
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(255,255,255,0.8)',
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
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e, #0ea5e9)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
            </span>
            <span>Profile</span>
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

      <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="composeCard">
          <h2 className="composeCardTitle">Compose New Email</h2>
          <p className="composeCardSubtitle">AI-powered email composition</p>

          <div className="composeField">
            <label className="composeFieldLabel">Recipient</label>
            <input
              className="composeInput"
              placeholder="Enter recipient email address"
              value={to}
              onChange={e => setTo(e.target.value)}
            />
          </div>

          <div className="composeField">
            <label className="composeFieldLabel">Subject</label>
            <input
              className="composeInput"
              placeholder="Enter email subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>

          <div className="composeField">
            <label className="composeFieldLabel">Description</label>
            <textarea
              className="composeTextarea"
              placeholder="Describe what you want to write in the email..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <button className="composePrimaryBtn" onClick={generate} disabled={!to || !subject || !description}>
            ✨ Generate Draft
          </button>

          {draft && (
            <div className="composeDraftWrap">
              <div className="composeDraftHeader">
                <span className="composeDraftHeaderTitle">📝 Generated Draft</span>
              </div>
              <pre className="composeDraft">{draft}</pre>

              <div className="composeDraftActions">
                <button className="composeActionBtn composeSaveBtn" onClick={save}>
                  💾 Save to Gmail
                </button>
                <button
                  className="composeActionBtn composeDiscardBtn"
                  onClick={() => setDraft("")}
                >
                  🗑️ Discard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

