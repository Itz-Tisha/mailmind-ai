

// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useTheme } from '../contexts/ThemeContext';
// import '../assets/Home.css';


// axios.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response && error.response.status === 401) {
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// const extractDueDate = (text) => {
//   // 1️⃣ YYYY-MM-DD
//   let match = text.match(/(\d{4})-(\d{2})-(\d{2})/);
//   if (match) return `${match[1]}-${match[2]}-${match[3]}`;

//   // 2️⃣ DD-MM-YYYY
//   match = text.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
//   if (match) {
//     const day = match[1].padStart(2, '0');
//     const month = match[2].padStart(2, '0');
//     return `${match[3]}-${month}-${day}`;
//   }

//   // 3️⃣ DD Month YYYY  (e.g., 28 February, 2026)
//   match = text.match(
//     /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December),?\s+(\d{4})/i
//   );

//   if (match) {
//     const day = match[1].padStart(2, '0');
//     const monthNames = {
//       january: '01',
//       february: '02',
//       march: '03',
//       april: '04',
//       may: '05',
//       june: '06',
//       july: '07',
//       august: '08',
//       september: '09',
//       october: '10',
//       november: '11',
//       december: '12'
//     };

//     const month = monthNames[match[2].toLowerCase()];
//     return `${match[3]}-${month}-${day}`;
//   }

//   return null;
// };
// const Home = () => {
//   const { colors, theme, toggleTheme } = useTheme();
//   const [user, setUser] = useState(null);
//   const [emails, setEmails] = useState([]);
//   const [selectedDate, setSelectedDate] = useState('');
//   const [loadingEmails, setLoadingEmails] = useState(false);
//   const [aiLoading, setAiLoading] = useState(false);
//   const [aiResult, setAiResult] = useState({});
//   const [expanded, setExpanded] = useState({});
//   const [generatedReply, setGeneratedReply] = useState("");
//   const [selectedThreadId, setSelectedThreadId] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [loadingReply, setLoadingReply] = useState(false);
//   const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

//   // Show notification helper function
//   const showNotification = (message, type = 'info') => {
//     setNotification({ show: true, message, type });
//     setTimeout(() => {
//       setNotification({ show: false, message: '', type: 'info' });
//     }, 4000);
//   };
    

// const handleMailClick = async (threadId) => {
//   console.log("Clicked threadId:", threadId);
//   setSelectedThreadId(threadId);
//   setLoadingReply(true);

//   try {
//     const res = await axios.post(
//   `${BACKEND_URL}/thread/generate-reply`,
//   { threadId },
//   {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("token")}`
//     }
//   }
// );

//     setGeneratedReply(res.data.reply);
//     setShowModal(true);

//   } catch (err) {
//     console.error(err);
//     showNotification("Failed to generate reply. Please try again.", 'error');
//   }

//   setLoadingReply(false);
// };

// const summarizeEmail = async (email, index) => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.post(
//         `${BACKEND_URL}/ai-extra/summarize`,
//         { email },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setAiResult(prev => ({
//         ...prev,
//         [index]: { ...(prev[index] || {}), summary: res.data.summary }
//       }));
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const categorizeEmail = async (email, index) => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.post(
//         `${BACKEND_URL}/ai-extra/categorize`,
//         { email },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setAiResult(prev => ({
//         ...prev,
//         [index]: { ...(prev[index] || {}), category: res.data }
//       }));
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchEmails = async (date = '') => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) return;

//       setLoadingEmails(true);

//       let url = `${BACKEND_URL}/gmail/emails`;
//       if (date) url += `?date=${date}`;

//       const res = await axios.get(url, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setEmails(res.data.emails || []);
//     } catch (err) {
//       console.error('Gmail fetch error:', err);
//     } finally {
//       setLoadingEmails(false);
//     }
//   };

//   const generateCalendarEvents = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token || emails.length === 0) return;

//       setAiLoading(true);

//       const KEYWORDS = ['due date', 'deadline', 'last date'];

//       const filteredEmails = emails.filter(email =>
//         KEYWORDS.some(keyword =>
//           (email.subject + ' ' + email.snippet)
//             .toLowerCase()
//             .includes(keyword)
//         )
//       );

//       const events = filteredEmails
//         .map(email => {
//           const dueDate = extractDueDate(
//             `${email.subject} ${email.snippet}`
//           );
//           if (!dueDate) return null;

//           return {
//             subject: email.subject,
//             from: email.from,
//             description: email.snippet,
//             dueDate,
//           };
//         })
//         .filter(Boolean);

//       if (events.length === 0) {
//         showNotification('No valid due dates found in your emails. Please check for emails with "due date", "deadline", or "last date" keywords.', 'info');
//         return;
//       }

//       const res = await axios.post(
//         `${BACKEND_URL}/calendar/add-events`,
//         { events },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       showNotification(`Successfully added ${res.data.added} event(s) to your calendar. ${res.data.skipped > 0 ? `${res.data.skipped} event(s) were skipped.` : ''}`, 'success');
//     } catch (err) {
//       console.error(err);
//       showNotification('Failed to add events to calendar. Please try again.', 'error');
//     } finally {
//       setAiLoading(false);
//     }
//   };

//   const generateAIDrafts = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token || emails.length === 0) return;

//       setAiLoading(true);

//       await axios.post(
//         `${BACKEND_URL}/gmail/generate-drafts`,
//         { emails },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       showNotification('AI reply drafts have been successfully created in your Gmail Drafts folder!', 'success');
//     } catch (err) {
//       console.error(err);
//       showNotification('Failed to generate drafts. Please try again.', 'error');
//     } finally {
//       setAiLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     window.location.href = '/login';
//   };

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const tokenFromURL = params.get('token');

//     if (tokenFromURL) {
//       localStorage.setItem('token', tokenFromURL);
//       window.history.replaceState({}, document.title, '/home');
//     }

//     const token = tokenFromURL || localStorage.getItem('token');
//     if (!token) return;

//     axios
//       .get(`${BACKEND_URL}/user/me`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then(res => setUser(res.data))
//       .catch(err => console.error(err));

//     fetchEmails();
//   }, []);

//   const stripDisclaimer = (htmlOrText) => {
//     if (!htmlOrText) return '';

//     const lower = htmlOrText.toLowerCase();
//     const markers = [
//       'disclaimer:',
//       'disclaimer -',
//       'confidentiality notice',
//       'this message is intended only for the person or entity',
//       'you received this message because',
//     ];

//     let cutIndex = htmlOrText.length;
//     markers.forEach(marker => {
//       const idx = lower.indexOf(marker.toLowerCase());
//       if (idx !== -1 && idx < cutIndex) {
//         cutIndex = idx;
//       }
//     });

//     return htmlOrText.slice(0, cutIndex);
//   };

//   return (
//     <div
//       style={{
//         minHeight: '100vh',
//         background: theme === 'dark'
//           ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
//           : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
//         fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
//         transition: 'background 0.5s ease',
//       }}
//     >
//       {/* Notification Toast */}
//       {notification.show && (
//         <div
//           style={{
//             position: 'fixed',
//             top: '20px',
//             right: '20px',
//             zIndex: 10000,
//             minWidth: '300px',
//             maxWidth: '500px',
//             padding: '16px 20px',
//             borderRadius: '12px',
//             background: notification.type === 'success'
//               ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
//               : notification.type === 'error'
//               ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
//               : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
//             color: '#ffffff',
//             boxShadow: theme === 'dark'
//               ? '0 8px 32px rgba(0,0,0,0.5)'
//               : '0 8px 32px rgba(0,0,0,0.2)',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '12px',
//             animation: 'slideIn 0.3s ease-out',
//             cursor: 'pointer',
//           }}
//           onClick={() => setNotification({ show: false, message: '', type: 'info' })}
//         >
//           <div style={{ fontSize: '20px' }}>
//             {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}
//           </div>
//           <div style={{ flex: 1, fontSize: '14px', fontWeight: 500, lineHeight: 1.5 }}>
//             {notification.message}
//           </div>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               setNotification({ show: false, message: '', type: 'info' });
//             }}
//             style={{
//               background: 'rgba(255,255,255,0.2)',
//               border: 'none',
//               color: '#ffffff',
//               fontSize: '18px',
//               cursor: 'pointer',
//               padding: '0',
//               width: '24px',
//               height: '24px',
//               borderRadius: '50%',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               transition: 'all 0.2s ease',
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
//             }}
//           >
//             ×
//           </button>
//         </div>
//       )}
//       {/* Top Navigation Bar */}
//       <div
//         style={{
//           background: theme === 'dark'
//             ? 'rgba(26,26,46,0.8)'
//             : 'rgba(255,255,255,0.9)',
//           backdropFilter: 'blur(20px)',
//           borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
//           padding: '20px 32px',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           position: 'sticky',
//           top: 0,
//           zIndex: 100,
//           boxShadow: theme === 'dark'
//             ? '0 4px 20px rgba(0,0,0,0.3)'
//             : '0 4px 20px rgba(0,0,0,0.1)',
//         }}
//       >
//         <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
//           <div
//             style={{
//               width: 48,
//               height: 48,
//               borderRadius: '12px',
//               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               fontWeight: 700,
//               fontSize: '20px',
//               color: '#ffffff',
//               boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
//             }}
//           >
//             PC
//           </div>
//           <div>
//             <h1
//               style={{
//                 margin: 0,
//                 fontSize: '20px',
//                 fontWeight: 700,
//                 color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
//               }}
//             >
//               Productivity Copilot
//             </h1>
//             <p
//               style={{
//                 margin: '2px 0 0',
//                 fontSize: '12px',
//                 color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
//               }}
//             >
//               {user?.email || 'Loading...'}
//             </p>
//           </div>
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//           <button
//             onClick={toggleTheme}
//             style={{
//               padding: '10px 16px',
//               borderRadius: '12px',
//               border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
//               background: theme === 'dark'
//                 ? 'rgba(255,255,255,0.1)'
//                 : 'rgba(255,255,255,0.8)',
//               color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
//               fontSize: '13px',
//               fontWeight: 600,
//               cursor: 'pointer',
//               display: 'inline-flex',
//               alignItems: 'center',
//               gap: '8px',
//               transition: 'all 0.2s ease',
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.transform = 'scale(1.05)';
//               e.currentTarget.style.background = theme === 'dark'
//                 ? 'rgba(255,255,255,0.15)'
//                 : 'rgba(255,255,255,1)';
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.transform = 'scale(1)';
//               e.currentTarget.style.background = theme === 'dark'
//                 ? 'rgba(255,255,255,0.1)'
//                 : 'rgba(255,255,255,0.8)';
//             }}
//           >
//             <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
//             <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
//           </button>

//           <button
//             onClick={() => window.location.href = '/compose'}
//             style={{
//               padding: '10px 16px',
//               borderRadius: '12px',
//               border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
//               background: theme === 'dark'
//                 ? 'rgba(255,255,255,0.1)'
//                 : 'rgba(255,255,255,0.8)',
//               color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
//               fontSize: '13px',
//               fontWeight: 600,
//               cursor: 'pointer',
//               display: 'inline-flex',
//               alignItems: 'center',
//               gap: '8px',
//               transition: 'all 0.2s ease',
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.transform = 'scale(1.05)';
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.transform = 'scale(1)';
//             }}
//           >
//             <span>✉️</span>
//             <span>Compose</span>
//           </button>

//           <button
//             onClick={() => window.location.href = '/profile'}
//             style={{
//               padding: '10px 16px',
//               borderRadius: '12px',
//               border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
//               background: theme === 'dark'
//                 ? 'rgba(255,255,255,0.1)'
//                 : 'rgba(255,255,255,0.8)',
//               color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
//               fontSize: '13px',
//               fontWeight: 600,
//               cursor: 'pointer',
//               display: 'inline-flex',
//               alignItems: 'center',
//               gap: '8px',
//               transition: 'all 0.2s ease',
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.transform = 'scale(1.05)';
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.transform = 'scale(1)';
//             }}
//           >
//             <span
//               style={{
//                 width: 24,
//                 height: 24,
//                 borderRadius: '50%',
//                 background: 'linear-gradient(135deg, #22c55e, #0ea5e9)',
//                 display: 'inline-flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontSize: '11px',
//                 fontWeight: 700,
//                 color: '#ffffff',
//               }}
//             >
//               {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
//             </span>
//             <span>Profile</span>
//           </button>

//           <button
//             onClick={handleLogout}
//             style={{
//               padding: '10px 20px',
//               borderRadius: '12px',
//               border: 'none',
//               background: 'linear-gradient(135deg, #ef4444, #dc2626)',
//               color: '#ffffff',
//               fontSize: '13px',
//               fontWeight: 600,
//               cursor: 'pointer',
//               transition: 'all 0.2s ease',
//               boxShadow: '0 4px 15px rgba(239,68,68,0.3)',
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.transform = 'scale(1.05)';
//               e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.4)';
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.transform = 'scale(1)';
//               e.currentTarget.style.boxShadow = '0 4px 15px rgba(239,68,68,0.3)';
//             }}
//           >
//             Logout
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
//         {/* Stats Cards */}
//         <div
//           style={{
//             display: 'grid',
//             gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//             gap: '20px',
//             marginBottom: '32px',
//           }}
//         >
//           <div
//             style={{
//               background: theme === 'dark'
//                 ? 'rgba(255,255,255,0.05)'
//                 : 'rgba(255,255,255,0.8)',
//               backdropFilter: 'blur(10px)',
//               borderRadius: '20px',
//               padding: '24px',
//               border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
//               boxShadow: theme === 'dark'
//                 ? '0 8px 32px rgba(0,0,0,0.3)'
//                 : '0 8px 32px rgba(0,0,0,0.1)',
//             }}
//           >
//             <div
//               style={{
//                 fontSize: '32px',
//                 fontWeight: 700,
//                 color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
//                 marginBottom: '8px',
//               }}
//             >
//               {emails.length}
//             </div>
//             <div
//               style={{
//                 fontSize: '14px',
//                 color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
//                 fontWeight: 500,
//               }}
//             >
//               Emails Loaded
//             </div>
//           </div>

//           <div
//             style={{
//               background: theme === 'dark'
//                 ? 'rgba(255,255,255,0.05)'
//                 : 'rgba(255,255,255,0.8)',
//               backdropFilter: 'blur(10px)',
//               borderRadius: '20px',
//               padding: '24px',
//               border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
//               boxShadow: theme === 'dark'
//                 ? '0 8px 32px rgba(0,0,0,0.3)'
//                 : '0 8px 32px rgba(0,0,0,0.1)',
//             }}
//           >
//             <div
//               style={{
//                 fontSize: '32px',
//                 fontWeight: 700,
//                 color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
//                 marginBottom: '8px',
//               }}
//             >
//               {Object.keys(aiResult).length}
//             </div>
//             <div
//               style={{
//                 fontSize: '14px',
//                 color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
//                 fontWeight: 500,
//               }}
//             >
//               AI Processed
//             </div>
//           </div>
//         </div>

//         {/* Controls Card */}
//         <div
//           style={{
//             background: theme === 'dark'
//               ? 'rgba(255,255,255,0.05)'
//               : 'rgba(255,255,255,0.8)',
//             backdropFilter: 'blur(10px)',
//             borderRadius: '20px',
//             padding: '28px',
//             marginBottom: '32px',
//             border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
//             boxShadow: theme === 'dark'
//               ? '0 8px 32px rgba(0,0,0,0.3)'
//               : '0 8px 32px rgba(0,0,0,0.1)',
//           }}
//         >
//           <h2
//             style={{
//               margin: '0 0 20px 0',
//               fontSize: '18px',
//               fontWeight: 700,
//               color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
//             }}
//           >
//             Email Controls
//           </h2>
//           <div
//             style={{
//               display: 'flex',
//               flexWrap: 'wrap',
//               gap: '12px',
//               alignItems: 'center',
//             }}
//           >
//             <input
//               type="date"
//               value={selectedDate}
//               onChange={e => setSelectedDate(e.target.value)}
//               style={{
//                 padding: '12px 16px',
//                 borderRadius: '12px',
//                 border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
//                 background: theme === 'dark'
//                   ? 'rgba(255,255,255,0.05)'
//                   : 'rgba(255,255,255,0.9)',
//                 color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
//                 fontSize: '14px',
//                 outline: 'none',
//                 transition: 'all 0.2s ease',
//               }}
//               onFocus={(e) => {
//                 e.currentTarget.style.borderColor = '#667eea';
//               }}
//               onBlur={(e) => {
//                 e.currentTarget.style.borderColor = theme === 'dark'
//                   ? 'rgba(255,255,255,0.2)'
//                   : 'rgba(0,0,0,0.2)';
//               }}
//             />
//             <button
//               onClick={() => fetchEmails(selectedDate)}
//               style={{
//                 padding: '12px 24px',
//                 borderRadius: '12px',
//                 border: 'none',
//                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                 color: '#ffffff',
//                 fontSize: '14px',
//                 fontWeight: 600,
//                 cursor: 'pointer',
//                 transition: 'all 0.2s ease',
//                 boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.transform = 'translateY(-2px)';
//                 e.currentTarget.style.boxShadow = '0 6px 20px rgba(102,126,234,0.5)';
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.transform = 'translateY(0)';
//                 e.currentTarget.style.boxShadow = '0 4px 15px rgba(102,126,234,0.4)';
//               }}
//             >
//               Fetch for Date
//             </button>
//             <button
//               onClick={() => fetchEmails()}
//               style={{
//                 padding: '12px 24px',
//                 borderRadius: '12px',
//                 border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
//                 background: theme === 'dark'
//                   ? 'rgba(255,255,255,0.05)'
//                   : 'rgba(255,255,255,0.9)',
//                 color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
//                 fontSize: '14px',
//                 fontWeight: 600,
//                 cursor: 'pointer',
//                 transition: 'all 0.2s ease',
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.background = theme === 'dark'
//                   ? 'rgba(255,255,255,0.1)'
//                   : 'rgba(255,255,255,1)';
//                 e.currentTarget.style.transform = 'translateY(-2px)';
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.background = theme === 'dark'
//                   ? 'rgba(255,255,255,0.05)'
//                   : 'rgba(255,255,255,0.9)';
//                 e.currentTarget.style.transform = 'translateY(0)';
//               }}
//             >
//               Today
//             </button>

//             <div style={{ flex: 1 }} />

//             <button
//               onClick={generateCalendarEvents}
//               disabled={aiLoading || emails.length === 0}
//               style={{
//                 padding: '12px 24px',
//                 borderRadius: '12px',
//                 border: 'none',
//                 background: aiLoading || emails.length === 0
//                   ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
//                   : 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
//                 color: aiLoading || emails.length === 0
//                   ? (theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
//                   : '#ffffff',
//                 fontSize: '14px',
//                 fontWeight: 600,
//                 cursor: aiLoading || emails.length === 0 ? 'not-allowed' : 'pointer',
//                 transition: 'all 0.2s ease',
//                 display: 'inline-flex',
//                 alignItems: 'center',
//                 gap: '8px',
//               }}
//               onMouseEnter={(e) => {
//                 if (!aiLoading && emails.length > 0) {
//                   e.currentTarget.style.transform = 'translateY(-2px)';
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.transform = 'translateY(0)';
//               }}
//             >
//               <span>📅</span>
//               <span>{aiLoading ? 'Creating...' : 'Create Events'}</span>
//             </button>

//             <button
//               onClick={generateAIDrafts}
//               disabled={aiLoading || emails.length === 0}
//               style={{
//                 padding: '12px 24px',
//                 borderRadius: '12px',
//                 border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
//                 background: theme === 'dark'
//                   ? 'rgba(255,255,255,0.05)'
//                   : 'rgba(255,255,255,0.9)',
//                 color: aiLoading || emails.length === 0
//                   ? (theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
//                   : (theme === 'dark' ? '#ffffff' : '#1a1a2e'),
//                 fontSize: '14px',
//                 fontWeight: 600,
//                 cursor: aiLoading || emails.length === 0 ? 'not-allowed' : 'pointer',
//                 transition: 'all 0.2s ease',
//                 display: 'inline-flex',
//                 alignItems: 'center',
//                 gap: '8px',
//               }}
//               onMouseEnter={(e) => {
//                 if (!aiLoading && emails.length > 0) {
//                   e.currentTarget.style.background = theme === 'dark'
//                     ? 'rgba(255,255,255,0.1)'
//                     : 'rgba(255,255,255,1)';
//                   e.currentTarget.style.transform = 'translateY(-2px)';
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.background = theme === 'dark'
//                   ? 'rgba(255,255,255,0.05)'
//                   : 'rgba(255,255,255,0.9)';
//                 e.currentTarget.style.transform = 'translateY(0)';
//               }}
//             >
//               <span>✨</span>
//               <span>{aiLoading ? 'Working...' : 'AI Drafts'}</span>
//             </button>
//           </div>
//         </div>

//         {/* Emails List */}
//         <div
//           style={{
//             background: theme === 'dark'
//               ? 'rgba(255,255,255,0.05)'
//               : 'rgba(255,255,255,0.8)',
//             backdropFilter: 'blur(10px)',
//             borderRadius: '20px',
//             padding: '28px',
//             border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
//             boxShadow: theme === 'dark'
//               ? '0 8px 32px rgba(0,0,0,0.3)'
//               : '0 8px 32px rgba(0,0,0,0.1)',
//           }}
//         >
//           <div
//             style={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               marginBottom: '24px',
//             }}
//           >
//             <h2
//               style={{
//                 margin: 0,
//                 fontSize: '18px',
//                 fontWeight: 700,
//                 color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
//               }}
//             >
//               Inbox
//             </h2>
//             <div
//               style={{
//                 fontSize: '13px',
//                 color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
//               }}
//             >
//               {loadingEmails
//                 ? 'Loading...'
//                 : emails.length
//                 ? `${emails.length} emails`
//                 : 'No emails'}
//             </div>
//           </div>

//           {loadingEmails ? (
//             <div
//               style={{
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 padding: '60px 20px',
//                 gap: '16px',
//                 color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
//               }}
//             >
//               <div
//                 style={{
//                   width: 24,
//                   height: 24,
//                   borderRadius: '50%',
//                   border: `3px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
//                   borderTopColor: '#667eea',
//                   animation: 'spin 0.9s linear infinite',
//                 }}
//               />
//               <span>Loading emails...</span>
//             </div>
//           ) : emails.length === 0 ? (
//             <div
//               style={{
//                 padding: '60px 20px',
//                 textAlign: 'center',
//                 color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
//               }}
//             >
//               <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
//               <div style={{ fontSize: '16px', fontWeight: 500 }}>
//                 No emails loaded. Click "Today" or select a date to fetch emails.
//               </div>
//             </div>
//           ) : (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//               {emails.map((email, i) => (
//                 <div
//                   key={i}
//                   style={{
//                     background: theme === 'dark'
//                       ? 'rgba(255,255,255,0.03)'
//                       : 'rgba(255,255,255,0.6)',
//                     borderRadius: '16px',
//                     padding: '20px',
//                     border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
//                     transition: 'all 0.2s ease',
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.transform = 'translateY(-2px)';
//                     e.currentTarget.style.boxShadow = theme === 'dark'
//                       ? '0 8px 24px rgba(0,0,0,0.4)'
//                       : '0 8px 24px rgba(0,0,0,0.15)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.transform = 'translateY(0)';
//                     e.currentTarget.style.boxShadow = 'none';
//                   }}
//                 >
//                   <div
//                     style={{
//                       display: 'flex',
//                       justifyContent: 'space-between',
//                       alignItems: 'flex-start',
//                       gap: '16px',
//                       marginBottom: '12px',
//                     }}
//                   >
//                     <div style={{ flex: 1 }}>
//                       <div
//                         style={{
//                           fontSize: '12px',
//                           color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
//                           marginBottom: '6px',
//                         }}
//                       >
//                         From: <span style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a2e', fontWeight: 600 }}>{email.from}</span>
//                       </div>
//                       <div
//                         style={{
//                           fontSize: '16px',
//                           fontWeight: 700,
//                           color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
//                           marginBottom: '8px',
//                         }}
//                       >
//                         {email.subject || '(No subject)'}
//                       </div>
//                     </div>
//                   </div>

//                   <div
//                     style={{
//                       fontSize: '14px',
//                       color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
//                       lineHeight: 1.6,
//                       marginBottom: '16px',
//                       maxHeight: expanded[i] ? 'none' : '60px',
//                       overflow: expanded[i] ? 'visible' : 'hidden',
//                       whiteSpace: 'pre-wrap',
//                       wordWrap: 'break-word',
//                     }}
//                     dangerouslySetInnerHTML={{
//                       __html: (() => {
//                         const content = expanded[i] 
//                           ? (email.body || email.snippet || '') 
//                           : (email.snippet || '');
//                         const cleaned = stripDisclaimer(content);
//                         // If content doesn't look like HTML, wrap it in a div to preserve formatting
//                         if (!cleaned.includes('<') && !cleaned.includes('>')) {
//                           return cleaned.split('\n').map(line => line || '<br/>').join('\n');
//                         }
//                         return cleaned;
//                       })(),
//                     }}
//                   />

//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setExpanded(prev => ({ ...prev, [i]: !prev[i] }));
//                     }}
//                     style={{
//                       marginBottom: '12px',
//                       padding: 0,
//                       border: 'none',
//                       background: 'none',
//                       color: '#667eea',
//                       fontSize: '13px',
//                       fontWeight: 600,
//                       cursor: 'pointer',
//                       textDecoration: 'underline',
//                     }}
//                   >
//                     {expanded[i] ? 'Read less' : 'Read more'}
//                   </button>

//                   <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
                        
//                         handleMailClick(email.threadId);
//                       }}
//                       disabled={loadingReply && selectedThreadId === email.threadId}
//                       style={{
//                         padding: '8px 16px',
//                         borderRadius: '10px',
//                         border: 'none',
//                         background: loadingReply && selectedThreadId === email.threadId
//                           ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
//                           : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
//                         color: loadingReply && selectedThreadId === email.threadId
//                           ? (theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
//                           : '#ffffff',
//                         fontSize: '12px',
//                         fontWeight: 600,
//                         cursor: loadingReply && selectedThreadId === email.threadId ? 'not-allowed' : 'pointer',
//                         transition: 'all 0.2s ease',
//                       }}
//                       onMouseEnter={(e) => {
//                         if (!(loadingReply && selectedThreadId === email.threadId)) {
//                           e.currentTarget.style.transform = 'scale(1.05)';
//                         }
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.transform = 'scale(1)';
//                       }}
//                     >
//                       {loadingReply && selectedThreadId === email.threadId ? '⏳ Generating...' : '✉️ Generate Reply'}
//                     </button>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         summarizeEmail(email, i);
//                       }}
//                       style={{
//                         padding: '8px 16px',
//                         borderRadius: '10px',
//                         border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
//                         background: theme === 'dark'
//                           ? 'rgba(255,255,255,0.05)'
//                           : 'rgba(255,255,255,0.9)',
//                         color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
//                         fontSize: '12px',
//                         fontWeight: 600,
//                         cursor: 'pointer',
//                         transition: 'all 0.2s ease',
//                       }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.background = theme === 'dark'
//                           ? 'rgba(255,255,255,0.1)'
//                           : 'rgba(255,255,255,1)';
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.background = theme === 'dark'
//                           ? 'rgba(255,255,255,0.05)'
//                           : 'rgba(255,255,255,0.9)';
//                       }}
//                     >
//                       📝 Summarize
//                     </button>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         categorizeEmail(email, i);
//                       }}
//                       style={{
//                         padding: '8px 16px',
//                         borderRadius: '10px',
//                         border: 'none',
//                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                         color: '#ffffff',
//                         fontSize: '12px',
//                         fontWeight: 600,
//                         cursor: 'pointer',
//                         transition: 'all 0.2s ease',
//                       }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.transform = 'scale(1.05)';
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.transform = 'scale(1)';
//                       }}
//                     >
//                       🔎 Categorize
//                     </button>
//                   </div>

//                   {aiResult[i]?.category && (
//                     <div
//                       style={{
//                         marginTop: '12px',
//                         padding: '12px 16px',
//                         borderRadius: '12px',
//                         background: theme === 'dark'
//                           ? 'rgba(102,126,234,0.15)'
//                           : 'rgba(102,126,234,0.08)',
//                         border: `1px solid ${theme === 'dark' ? 'rgba(102,126,234,0.4)' : 'rgba(102,126,234,0.3)'}`,
//                         fontSize: '13px',
//                         fontFamily: 'monospace',
//                         color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : '#1a1a2e',
//                         lineHeight: 1.8,
//                       }}
//                     >
//                       <div style={{ marginBottom: '4px' }}>
//                         <span style={{ color: theme === 'dark' ? '#a5b4fc' : '#6366f1' }}>category:</span>
//                         <span style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a2e', marginLeft: '8px' }}>
//                           '{aiResult[i].category.category}'
//                         </span>
//                       </div>
//                       <div style={{ marginBottom: '4px' }}>
//                         <span style={{ color: theme === 'dark' ? '#a5b4fc' : '#6366f1' }}>subcategory:</span>
//                         <span style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a2e', marginLeft: '8px' }}>
//                           '{aiResult[i].category.subcategory}'
//                         </span>
//                       </div>
//                       <div style={{ marginBottom: '4px' }}>
//                         <span style={{ color: theme === 'dark' ? '#a5b4fc' : '#6366f1' }}>priority:</span>
//                         <span style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a2e', marginLeft: '8px' }}>
//                           '{aiResult[i].category.priority}'
//                         </span>
//                       </div>
//                       <div>
//                         <span style={{ color: theme === 'dark' ? '#a5b4fc' : '#6366f1' }}>actionRequired:</span>
//                         <span style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a2e', marginLeft: '8px' }}>
//                           '{aiResult[i].category.actionRequired}'
//                         </span>
//                       </div>
//                     </div>
//                   )}

//                   {aiResult[i]?.summary && (
//                     <div
//                       style={{
//                         marginTop: '12px',
//                         padding: '12px',
//                         borderRadius: '12px',
//                         background: theme === 'dark'
//                           ? 'rgba(102,126,234,0.1)'
//                           : 'rgba(102,126,234,0.05)',
//                         border: `1px solid ${theme === 'dark' ? 'rgba(102,126,234,0.3)' : 'rgba(102,126,234,0.2)'}`,
//                         fontSize: '13px',
//                         color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : '#1a1a2e',
//                       }}
//                     >
//                       <strong>Summary:</strong> {aiResult[i].summary}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//        {showModal && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             background: "rgba(0,0,0,0.6)",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             zIndex: 9999
//           }}
//         >
//           <div
//             style={{
//               background: "#ffffff",
//               width: "600px",
//               padding: "24px",
//               borderRadius: "12px"
//             }}
//           >
//             <h3>AI Generated Reply</h3>

//             <textarea
//               value={generatedReply}
//               onChange={(e) => setGeneratedReply(e.target.value)}
//               rows={10}
//               style={{
//                 width: "100%",
//                 padding: "10px",
//                 marginBottom: "16px"
//               }}
//             />

//             <div style={{ display: "flex", justifyContent: "space-between" }}>
//               <button onClick={() => setShowModal(false)}>
//                 Discard
//               </button>

//               <button
//                 onClick={async () => {
//                   try {
//                     await axios.post(
//                       `${BACKEND_URL}/thread/save-draft`,
//                       {
//                         threadId: selectedThreadId,
//                         replyBody: generatedReply
//                       },
//                       {
//                         headers: {
//                           Authorization: `Bearer ${localStorage.getItem("token")}`
//                         }
//                       }
//                     );

//                     showNotification("Draft saved successfully to Gmail!", 'success');
//                     setShowModal(false);

//                   } catch (err) {
//                     showNotification("Failed to save draft. Please try again.", 'error');
//                   }
//                 }}
//               >
//                 Save to Draft
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }
//         @keyframes slideIn {
//           from {
//             transform: translateX(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateX(0);
//             opacity: 1;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Home;




import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import '../assets/Home.css';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// const extractDueDate = (text) => {
//   // 1️⃣ YYYY-MM-DD
//   let match = text.match(/(\d{4})-(\d{2})-(\d{2})/);
//   if (match) return `${match[1]}-${match[2]}-${match[3]}`;

//   // 2️⃣ DD-MM-YYYY
//   match = text.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
//   if (match) {
//     const day = match[1].padStart(2, '0');
//     const month = match[2].padStart(2, '0');
//     return `${match[3]}-${month}-${day}`;
//   }

//   // 3️⃣ DD Month YYYY  (e.g., 28 February, 2026)
//   match = text.match(
//     /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December),?\s+(\d{4})/i
//   );

//   if (match) {
//     const day = match[1].padStart(2, '0');
//     const monthNames = {
//       january: '01',
//       february: '02',
//       march: '03',
//       april: '04',
//       may: '05',
//       june: '06',
//       july: '07',
//       august: '08',
//       september: '09',
//       october: '10',
//       november: '11',
//       december: '12'
//     };

//     const month = monthNames[match[2].toLowerCase()];
//     return `${match[3]}-${month}-${day}`;
//   }

//   return null;
// };




const extractDueDate = (text) => {
  const lower = text.toLowerCase();
  const today = new Date();

  // 1️⃣ today
  if (lower.includes("today")) {
    return today.toISOString().split("T")[0];
  }

  // 2️⃣ tomorrow
  if (lower.includes("tomorrow")) {
    const d = new Date();
    d.setDate(today.getDate() + 1);
    return d.toISOString().split("T")[0];
  }

  // 3️⃣ yesterday
  if (lower.includes("yesterday")) {
    const d = new Date();
    d.setDate(today.getDate() - 1);
    return d.toISOString().split("T")[0];
  }

  // 4️⃣ next Monday / next Tuesday
  const matchNextDay = lower.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);

  if (matchNextDay) {
    const days = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };

    const target = days[matchNextDay[1]];
    const date = new Date();
    const diff = (target + 7 - date.getDay()) % 7 || 7;

    date.setDate(date.getDate() + diff);
    return date.toISOString().split("T")[0];
  }

  // 5️⃣ YYYY-MM-DD
  let match = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;

  // 6️⃣ DD-MM-YYYY
  match = text.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (match) {
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    return `${match[3]}-${month}-${day}`;
  }

  // 7️⃣ 28 February 2026
  match = text.match(
    /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December),?\s+(\d{4})/i
  );

  if (match) {
    const day = match[1].padStart(2, "0");

    const monthNames = {
      january: "01",
      february: "02",
      march: "03",
      april: "04",
      may: "05",
      june: "06",
      july: "07",
      august: "08",
      september: "09",
      october: "10",
      november: "11",
      december: "12"
    };

    const month = monthNames[match[2].toLowerCase()];
    return `${match[3]}-${month}-${day}`;
  }

  return null;
};











const Home = () => {
  const { colors, theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [emails, setEmails] = useState([]);
  // const [selectedDate, setSelectedDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
  return localStorage.getItem('selectedDate') || '';
});
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState({});
  const [expanded, setExpanded] = useState({});
  const [generatedReply, setGeneratedReply] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  // Show notification helper function
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 4000);
  };
    

const handleMailClick = async (threadId) => {
  console.log("Clicked threadId:", threadId);
  setSelectedThreadId(threadId);
  setLoadingReply(true);

  try {
    const res = await axios.post(
      `${BACKEND_URL}/thread/generate-reply`,
      { threadId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    setGeneratedReply(res.data.reply);
    setShowModal(true);

  } catch (err) {
    console.error(err);
    showNotification("Failed to generate reply. Please try again.", 'error');
  }

  setLoadingReply(false);
};


const summarizeEmail = async (email, index) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${BACKEND_URL}/ai-extra/summarize`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAiResult(prev => ({
        ...prev,
        [index]: { ...(prev[index] || {}), summary: res.data.summary }
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const categorizeEmail = async (email, index) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${BACKEND_URL}/ai-extra/categorize`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAiResult(prev => ({
        ...prev,
        [index]: { ...(prev[index] || {}), category: res.data }
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // const fetchEmails = async (date = '') => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     if (!token) return;

  //     setLoadingEmails(true);

  //     let url = `${BACKEND_URL}/gmail/emails`;
  //     if (date) url += `?date=${date}`;

  //     const res = await axios.get(url, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     setEmails(res.data.emails || []);
  //   } catch (err) {
  //     console.error('Gmail fetch error:', err);
  //   } finally {
  //     setLoadingEmails(false);
  //   }
  // };


  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const fetchEmails = async (date = '') => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const cacheKey = `emails_${date || 'today'}`;
    const cachedData = localStorage.getItem(cacheKey);

    // ✅ Check cache first
    if (cachedData) {
      const parsed = JSON.parse(cachedData);

      const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;

      if (!isExpired) {
        console.log("Using cached emails");
        setEmails(parsed.emails);
        return; // 🚀 STOP API CALL
      }
    }

    // ❗ If no cache or expired → call API
    console.log("Fetching from API...");
    setLoadingEmails(true);

    let url = `${BACKEND_URL}/gmail/emails`;
    if (date) url += `?date=${date}`;

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const emails = res.data.emails || [];
    setEmails(emails);

    // ✅ Save to cache
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        emails,
        timestamp: Date.now(),
      })
    );

  } catch (err) {
    console.error('Gmail fetch error:', err);
  } finally {
    setLoadingEmails(false);
  }
};

  const generateCalendarEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || emails.length === 0) return;

      setAiLoading(true);

      //const KEYWORDS = ['due date', 'deadline', 'last date'];

            const KEYWORDS = [
        'today',
        'tomorrow',
        'due date',
        'deadline',
        'last date',
        'due',
        'submission date',
        'submit by',
        'meeting',
        'appointment',
        'schedule',
        'scheduled on',
        'event',
        'webinar',
        'session',
        'workshop',
        'reminder',
        'starts at',
        'starting on',
        'ends on',
        'before'
      ];

      // const KEYWORDS = ['due', 'deadline', 'submit', 'last date', 'exam', 'interview'];
      const filteredEmails = emails.filter(email =>
        KEYWORDS.some(keyword =>
          (email.subject + ' ' + email.snippet)
            .toLowerCase()
            .includes(keyword)
        )
      );

      const events = filteredEmails
        .map(email => {
          const dueDate = extractDueDate(
            `${email.subject} ${email.snippet}`
          );
          if (!dueDate) return null;

          return {
            subject: email.subject,
            from: email.from,
            description: email.snippet,
            dueDate,
          };
        })
        .filter(Boolean);

      if (events.length === 0) {
        showNotification('No valid due dates found in your emails. Please check for emails with "due date", "deadline", or "last date" keywords.', 'info');
        return;
      }

      const res = await axios.post(
        `${BACKEND_URL}/calendar/add-events`,
        { events },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification(`Successfully added ${res.data.added} event(s) to your calendar. ${res.data.skipped > 0 ? `${res.data.skipped} event(s) were skipped.` : ''}`, 'success');
    } catch (err) {
      console.error(err);
      showNotification('Failed to add events to calendar. Please try again.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const generateAIDrafts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || emails.length === 0) return;

      setAiLoading(true);

      await axios.post(
        `${BACKEND_URL}/gmail/generate-drafts`,
        { emails },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification('AI reply drafts have been successfully created in your Gmail Drafts folder!', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Failed to generate drafts. Please try again.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   const tokenFromURL = params.get('token');

  //   if (tokenFromURL) {
  //     localStorage.setItem('token', tokenFromURL);
  //     window.history.replaceState({}, document.title, '/home');
  //   }

  //   const token = tokenFromURL || localStorage.getItem('token');
  //   if (!token) return;

  //   axios
  //     .get(`${BACKEND_URL}/user/me`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })
  //     .then(res => setUser(res.data))
  //     .catch(err => console.error(err));

  //   fetchEmails();
  // }, []);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const tokenFromURL = params.get('token');

  if (tokenFromURL) {
    localStorage.setItem('token', tokenFromURL);
    window.history.replaceState({}, document.title, '/home');
  }

  const token = tokenFromURL || localStorage.getItem('token');
  if (!token) return;

  axios
    .get(`${BACKEND_URL}/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setUser(res.data))
    .catch(err => console.error(err));

  // ✅ This will now use cache if available
  // fetchEmails();
  const savedDate = localStorage.getItem('selectedDate') || '';
fetchEmails(savedDate);

}, []);

  const stripDisclaimer = (htmlOrText) => {
    if (!htmlOrText) return '';

    const lower = htmlOrText.toLowerCase();
    const markers = [
      'disclaimer:',
      'disclaimer -',
      'confidentiality notice',
      'this message is intended only for the person or entity',
      'you received this message because',
    ];

    let cutIndex = htmlOrText.length;
    markers.forEach(marker => {
      const idx = lower.indexOf(marker.toLowerCase());
      if (idx !== -1 && idx < cutIndex) {
        cutIndex = idx;
      }
    });

    return htmlOrText.slice(0, cutIndex);
  };

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
          background: theme === 'dark'
            ? 'rgba(26,26,46,0.8)'
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
              SmartInbox
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
            onClick={() => window.location.href = '/compose'}
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
            <span>✉️</span>
            <span>Compose</span>
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

      {/* Main Content */}
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Stats Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              background: theme === 'dark'
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '24px',
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              boxShadow: theme === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.3)'
                : '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 700,
                color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
                marginBottom: '8px',
              }}
            >
              {emails.length}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                fontWeight: 500,
              }}
            >
              Emails Loaded
            </div>
          </div>

          <div
            style={{
              background: theme === 'dark'
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '24px',
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              boxShadow: theme === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.3)'
                : '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 700,
                color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
                marginBottom: '8px',
              }}
            >
              {Object.keys(aiResult).length}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                fontWeight: 500,
              }}
            >
              AI Processed
            </div>
          </div>
        </div>

        {/* Controls Card */}
        <div
          style={{
            background: theme === 'dark'
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '28px',
            marginBottom: '32px',
            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            boxShadow: theme === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.3)'
              : '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: 700,
              color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
            }}
          >
            Email Controls
          </h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <input
              type="date"
              value={selectedDate}
               onChange={e => {
    const date = e.target.value;
    setSelectedDate(date);
    localStorage.setItem('selectedDate', date);
  }}
                 
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                background: theme === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(255,255,255,0.9)',
                color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme === 'dark'
                  ? 'rgba(255,255,255,0.2)'
                  : 'rgba(0,0,0,0.2)';
              }}
            />
            <button
              // onClick={() => fetchEmails(selectedDate)}
               onClick={() => {
    localStorage.setItem('selectedDate', selectedDate);
    fetchEmails(selectedDate);
  }}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102,126,234,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102,126,234,0.4)';
              }}
            >
              Fetch for Date
            </button>
            <button
              // onClick={() => fetchEmails()}
              onClick={() => {
    setSelectedDate('');
    localStorage.setItem('selectedDate', '');
    fetchEmails();
  }}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                background: theme === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(255,255,255,0.9)',
                color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme === 'dark'
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(255,255,255,1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(255,255,255,0.9)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Today
            </button>

            <div style={{ flex: 1 }} />

            <button
              onClick={generateCalendarEvents}
              disabled={aiLoading || emails.length === 0}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: aiLoading || emails.length === 0
                  ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
                  : 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                color: aiLoading || emails.length === 0
                  ? (theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
                  : '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: aiLoading || emails.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (!aiLoading && emails.length > 0) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>📅</span>
              <span>{aiLoading ? 'Creating...' : 'Create Events'}</span>
            </button>

            <button
              onClick={generateAIDrafts}
              disabled={aiLoading || emails.length === 0}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                background: theme === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(255,255,255,0.9)',
                color: aiLoading || emails.length === 0
                  ? (theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
                  : (theme === 'dark' ? '#ffffff' : '#1a1a2e'),
                fontSize: '14px',
                fontWeight: 600,
                cursor: aiLoading || emails.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (!aiLoading && emails.length > 0) {
                  e.currentTarget.style.background = theme === 'dark'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(255,255,255,1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(255,255,255,0.9)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>✨</span>
              <span>{aiLoading ? 'Working...' : 'AI Drafts'}</span>
            </button>
          </div>
        </div>

        {/* Emails List */}
        <div
          style={{
            background: theme === 'dark'
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '28px',
            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            boxShadow: theme === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.3)'
              : '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
              }}
            >
              Inbox
            </h2>
            <div
              style={{
                fontSize: '13px',
                color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
              }}
            >
              {loadingEmails
                ? 'Loading...'
                : emails.length
                ? `${emails.length} emails`
                : 'No emails'}
            </div>
          </div>

          {loadingEmails ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '60px 20px',
                gap: '16px',
                color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: `3px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                  borderTopColor: '#667eea',
                  animation: 'spin 0.9s linear infinite',
                }}
              />
              <span>Loading emails...</span>
            </div>
          ) : emails.length === 0 ? (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>
                No emails loaded. Click "Today" or select a date to fetch emails.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {emails.map((email, i) => (
                <div
                  key={i}
                  style={{
                    background: theme === 'dark'
                      ? 'rgba(255,255,255,0.03)'
                      : 'rgba(255,255,255,0.6)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = theme === 'dark'
                      ? '0 8px 24px rgba(0,0,0,0.4)'
                      : '0 8px 24px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '16px',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '12px',
                          color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                          marginBottom: '6px',
                        }}
                      >
                        From: <span style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a2e', fontWeight: 600 }}>{email.from}</span>
                      </div>
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
                          marginBottom: '8px',
                        }}
                      >
                        {email.subject || '(No subject)'}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '14px',
                      color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                      lineHeight: 1.6,
                      marginBottom: '16px',
                      maxHeight: expanded[i] ? 'none' : '60px',
                      overflow: expanded[i] ? 'visible' : 'hidden',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: (() => {
                        const content = expanded[i] 
                          ? (email.body || email.snippet || '') 
                          : (email.snippet || '');
                        const cleaned = stripDisclaimer(content);
                        // If content doesn't look like HTML, wrap it in a div to preserve formatting
                        if (!cleaned.includes('<') && !cleaned.includes('>')) {
                          return cleaned.split('\n').map(line => line || '<br/>').join('\n');
                        }
                        return cleaned;
                      })(),
                    }}
                  />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(prev => ({ ...prev, [i]: !prev[i] }));
                    }}
                    style={{
                      marginBottom: '12px',
                      padding: 0,
                      border: 'none',
                      background: 'none',
                      color: '#667eea',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {expanded[i] ? 'Read less' : 'Read more'}
                  </button>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMailClick(email.threadId);
                      }}
                      disabled={loadingReply && selectedThreadId === email.threadId}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        background: loadingReply && selectedThreadId === email.threadId
                          ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
                          : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        color: loadingReply && selectedThreadId === email.threadId
                          ? (theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
                          : '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: loadingReply && selectedThreadId === email.threadId ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!(loadingReply && selectedThreadId === email.threadId)) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {loadingReply && selectedThreadId === email.threadId ? '⏳ Generating...' : '✉️ Generate Reply'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        summarizeEmail(email, i);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                        background: theme === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(255,255,255,0.9)',
                        color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme === 'dark'
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(255,255,255,1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(255,255,255,0.9)';
                      }}
                    >
                      📝 Summarize
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        categorizeEmail(email, i);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      🔎 Categorize
                    </button>
                  </div>

                  {aiResult[i]?.category && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: theme === 'dark'
                          ? 'rgba(102,126,234,0.15)'
                          : 'rgba(102,126,234,0.08)',
                        border: `1px solid ${theme === 'dark' ? 'rgba(102,126,234,0.4)' : 'rgba(102,126,234,0.3)'}`,
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : '#1a1a2e',
                        lineHeight: 1.8,
                      }}
                    >
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ color: theme === 'dark' ? '#a5b4fc' : '#6366f1' }}>category:</span>
                        <span style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a2e', marginLeft: '8px' }}>
                          '{aiResult[i].category.category}'
                        </span>
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ color: theme === 'dark' ? '#a5b4fc' : '#6366f1' }}>subcategory:</span>
                        <span style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a2e', marginLeft: '8px' }}>
                          '{aiResult[i].category.subcategory}'
                        </span>
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ color: theme === 'dark' ? '#a5b4fc' : '#6366f1' }}>priority:</span>
                        <span style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a2e', marginLeft: '8px' }}>
                          '{aiResult[i].category.priority}'
                        </span>
                      </div>
                      <div>
                        <span style={{ color: theme === 'dark' ? '#a5b4fc' : '#6366f1' }}>actionRequired:</span>
                        <span style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a2e', marginLeft: '8px' }}>
                          '{aiResult[i].category.actionRequired}'
                        </span>
                      </div>
                    </div>
                  )}

                  {aiResult[i]?.summary && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: theme === 'dark'
                          ? 'rgba(102,126,234,0.1)'
                          : 'rgba(102,126,234,0.05)',
                        border: `1px solid ${theme === 'dark' ? 'rgba(102,126,234,0.3)' : 'rgba(102,126,234,0.2)'}`,
                        fontSize: '13px',
                        color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : '#1a1a2e',
                      }}
                    >
                      <strong>Summary:</strong> {aiResult[i].summary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="homeReplyModalBackdrop">
          <div className="homeReplyModal">
            <div className="homeReplyModalHeader">
              <div className="homeReplyModalTitleRow">
                <span className="homeReplyModalTitleIcon">✨</span>
                <div>
                  <h3 className="homeReplyModalTitle">AI Generated Reply</h3>
                  <p className="homeReplyModalSubtitle">
                    Review and edit the suggested reply, then save it as a Gmail draft.
                  </p>
                </div>
              </div>
              <button
                className="homeReplyModalCloseBtn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <textarea
              value={generatedReply}
              onChange={(e) => setGeneratedReply(e.target.value)}
              rows={10}
              className="homeReplyModalTextarea"
            />

            <div className="homeReplyModalFooter">
              <button
                className="homeReplyModalGhostBtn"
                onClick={() => setShowModal(false)}
              >
                Discard
              </button>

              <button
                className="homeReplyModalPrimaryBtn"
                onClick={async () => {
                  try {
                    await axios.post(
                      `${BACKEND_URL}/thread/save-draft`,
                      {
                        threadId: selectedThreadId,
                        replyBody: generatedReply
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                      }
                    );

                    showNotification("Draft saved successfully to Gmail!", 'success');
                    setShowModal(false);

                  } catch (err) {
                    showNotification("Failed to save draft. Please try again.", 'error');
                  }
                }}
              >
                Save to Draft
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
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
};

export default Home;
