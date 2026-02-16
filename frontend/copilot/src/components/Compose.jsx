import { useState } from "react";
import axios from "axios";
import "./Compose.css";

export default function Compose() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [draft, setDraft] = useState("");

  const generate = async () => {
    const res = await axios.post("http://localhost:5000/api/compose/generate", {
      userId: "123",
      to,
      subject,
      description
    });

    setDraft(res.data.draft);
  };

  const save = async () => {
    await axios.post(
      "http://localhost:5000/api/compose/save",
      {
        userId: "123",
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

    alert("Saved to Gmail!");
    setDraft("");
  };

  return (
    <div className="composePage">
      <div className="composeCard">
        <div className="composeField">
          <input
            className="composeInput"
            placeholder="To"
            onChange={e => setTo(e.target.value)}
          />
        </div>

        <div className="composeField">
          <input
            className="composeInput"
            placeholder="Subject"
            onChange={e => setSubject(e.target.value)}
          />
        </div>

        <div className="composeField">
          <textarea
            className="composeTextarea"
            placeholder="Description"
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <button className="composePrimaryBtn" onClick={generate}>
          Generate Draft
        </button>

        {draft && (
          <div className="composeDraftWrap">
            <pre className="composeDraft">{draft}</pre>

            <div className="composeDraftActions">
              <button className="composeActionBtn composeSaveBtn" onClick={save}>
                Save Draft
              </button>
              <button
                className="composeActionBtn composeDiscardBtn"
                onClick={() => setDraft("")}
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
