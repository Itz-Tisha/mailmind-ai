import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import '../assets/Home.css';

const BACKEND_URL =  'http://localhost:5000';
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

const extractDueDate = (text) => {
  let match = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;

  match = text.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    return `${match[3]}-${month}-${day}`;
  }

  return null;
};

const Home = () => {
  const { colors, theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [emails, setEmails] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState({});
  const [expanded, setExpanded] = useState({});

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

  const fetchEmails = async (date = '') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setLoadingEmails(true);

      let url = `${BACKEND_URL}/gmail/emails`;
      if (date) url += `?date=${date}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEmails(res.data.emails || []);
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

      const KEYWORDS = ['due date', 'deadline', 'last date'];

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
        alert('No valid due dates found.');
        return;
      }

      const res = await axios.post(
        `${BACKEND_URL}/calendar/add-events`,
        { events },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Added: ${res.data.added}\nSkipped: ${res.data.skipped}`);
    } catch (err) {
      console.error(err);
      alert('Failed to add events');
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

      alert('AI reply drafts created in Gmail (Drafts)');
    } catch (err) {
      console.error(err);
      alert('Failed to generate drafts');
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

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

    fetchEmails();
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
    <div className="homePage">
      {/* Top Navigation Bar */}
      <div className="homeTopbar">
        <div className="homeBrand">
          <div className="homeBrandLogo">PC</div>
          <div>
            <h1 className="homeBrandTitle">Productivity Copilot</h1>
            <p className="homeBrandSubtitle">{user?.email || 'Loading...'}</p>
          </div>
        </div>

        <div className="homeActions">
          <button onClick={toggleTheme} className="homeBtn">
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <button onClick={() => window.location.href = '/profile'} className="homeBtn">
            <span className="homeProfileBadge">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
            </span>
            <span>Profile</span>
          </button>

          <button onClick={handleLogout} className="homeLogoutBtn">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="homeMain">
        {/* Stats Cards */}
        <div className="homeStatsGrid">
          <div className="homeCard homeStatCard">
            <div className="homeStatNumber">
              {emails.length}
            </div>
            <div className="homeStatLabel">
              Emails Loaded
            </div>
          </div>

          <div className="homeCard homeStatCard">
            <div className="homeStatNumber">
              {Object.keys(aiResult).length}
            </div>
            <div className="homeStatLabel">
              AI Processed
            </div>
          </div>
        </div>

        {/* Controls Card */}
        <div className="homeCard homeCardMb">
          <h2 className="homeSectionTitle">Email Controls</h2>
          <div className="homeControlsRow">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="homeDateInput"
            />
            <button
              onClick={() => fetchEmails(selectedDate)}
              className="homePrimaryBtn"
            >
              Fetch for Date
            </button>
            <button
              onClick={() => fetchEmails()}
              className="homeOutlineBtn"
            >
              Today
            </button>

            <div className="homeSpacer" />

            <button
              onClick={generateCalendarEvents}
              disabled={aiLoading || emails.length === 0}
              className="homeBlueBtn"
            >
              <span>📅</span>
              <span>{aiLoading ? 'Creating...' : 'Create Events'}</span>
            </button>

            <button
              onClick={generateAIDrafts}
              disabled={aiLoading || emails.length === 0}
              className="homeOutlineBtn"
            >
              <span>✨</span>
              <span>{aiLoading ? 'Working...' : 'AI Drafts'}</span>
            </button>
          </div>
        </div>

        {/* Emails List */}
        <div className="homeCard">
          <div className="homeEmailsHeader">
            <h2 className="homeSectionTitle">
              Inbox
            </h2>
            <div className="homeMetaText">
              {loadingEmails
                ? 'Loading...'
                : emails.length
                ? `${emails.length} emails`
                : 'No emails'}
            </div>
          </div>

          {loadingEmails ? (
            <div className="homeLoading">
              <div className="homeSpinner" />
              <span>Loading emails...</span>
            </div>
          ) : emails.length === 0 ? (
            <div className="homeEmpty">
              <div className="homeEmptyIcon">📧</div>
              <div className="homeEmptyText">
                No emails loaded. Click "Today" or select a date to fetch emails.
              </div>
            </div>
          ) : (
            <div className="homeEmailsList">
              {emails.map((email, i) => (
                <div key={i} className="homeEmailItem">
                  <div className="homeEmailHeader">
                    <div className="homeEmailHeaderMain">
                      <div className="homeEmailMeta">
                        From:{' '}
                        <span className="homeEmailFromValue">{email.from}</span>
                      </div>
                      <div className="homeEmailSubject">
                        {email.subject || '(No subject)'}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`homeEmailSnippet ${expanded[i] ? 'isExpanded' : ''}`}
                    dangerouslySetInnerHTML={{
                      __html: stripDisclaimer(
                        expanded[i] ? (email.body || email.snippet) : email.snippet
                      ),
                    }}
                  />

                  {email.body && email.body.length > email.snippet.length && (
                    <button
                      onClick={() => setExpanded(prev => ({ ...prev, [i]: !prev[i] }))}
                      className="homeLinkBtn"
                    >
                      {expanded[i] ? 'Show less' : 'Read full email'}
                    </button>
                  )}

                  <div className="homeEmailActions">
                    <button
                      onClick={() => summarizeEmail(email, i)}
                      className="homeSmallBtn"
                    >
                      📝 Summarize
                    </button>
                    <button
                      onClick={() => categorizeEmail(email, i)}
                      className="homeSmallBtn homeSmallBtnPrimary"
                    >
                      🔎 Categorize
                    </button>
                  </div>

                  {aiResult[i]?.category && (
                    <div className="homeAiCategoryBox">
                      <div className="homeAiRow">
                        <span className="homeAiKey">category:</span>
                        <span className="homeAiValue">
                          '{aiResult[i].category.category}'
                        </span>
                      </div>
                      <div className="homeAiRow">
                        <span className="homeAiKey">subcategory:</span>
                        <span className="homeAiValue">
                          '{aiResult[i].category.subcategory}'
                        </span>
                      </div>
                      <div className="homeAiRow">
                        <span className="homeAiKey">priority:</span>
                        <span className="homeAiValue">
                          '{aiResult[i].category.priority}'
                        </span>
                      </div>
                      <div>
                        <span className="homeAiKey">actionRequired:</span>
                        <span className="homeAiValue">
                          '{aiResult[i].category.actionRequired}'
                        </span>
                      </div>
                    </div>
                  )}

                  {aiResult[i]?.summary && (
                    <div className="homeAiSummaryBox">
                      <strong>Summary:</strong> {aiResult[i].summary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
