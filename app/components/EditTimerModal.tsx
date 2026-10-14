type EditTimerModalProps = {
  clientName: string;
  hours: string;
  minutes: string;
  seconds: string;
  validDuration: boolean;
  busy?: boolean;
  error?: string;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
  onSecondsChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function EditTimerModal({
  clientName,
  hours,
  minutes,
  seconds,
  validDuration,
  busy = false,
  error,
  onHoursChange,
  onMinutesChange,
  onSecondsChange,
  onSave,
  onCancel,
}: EditTimerModalProps) {
  const fields = [
    {
      label: "Hours",
      value: hours,
      onChange: onHoursChange,
      max: 9999,
    },
    {
      label: "Minutes",
      value: minutes,
      onChange: onMinutesChange,
      max: 59,
    },
    {
      label: "Seconds",
      value: seconds,
      onChange: onSecondsChange,
      max: 59,
    },
  ];

  return (
    <div className="modal-backdrop">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onCancel();
          }
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          <div className="dashboard-logo" aria-hidden="true">
            ⏱
          </div>

          <div>
            <h2 id="edit-title" className="modal-title">
              Edit Countdown
            </h2>

            <p className="subtitle">{clientName}</p>
          </div>
        </div>

        {/* Duration form */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          <div className="duration-fields">
            {fields.map((field) => (
              <label key={field.label}>
                <span className="form-label">{field.label}</span>

                <input
                  className="form-input"
                  type="number"
                  min={0}
                  max={field.max}
                  step={1}
                  required
                  value={field.value}
                  disabled={busy}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              </label>
            ))}
          </div>

          <p className="modal-description" style={{ marginTop: "20px" }}>
            Set the countdown duration. Saving also updates the time used by
            Reset.
          </p>

          {/* Action buttons */}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={busy}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={busy || !validDuration}
            >
              {busy ? "Saving…" : "Save Timer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
