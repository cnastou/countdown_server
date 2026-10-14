type AddClientModalProps = {
  name: string;
  busy?: boolean;
  error?: string;
  onNameChange: (name: string) => void;
  onAdd: () => void;
  onCancel: () => void;
};

export default function AddClientModal({
  name,
  busy = false,
  error,
  onNameChange,
  onAdd,
  onCancel,
}: AddClientModalProps) {
  return (
    <div className="modal-backdrop">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onCancel();
          }
        }}
      >
        <h2 id="add-title" className="modal-title">
          Add New Client
        </h2>

        <p className="modal-description">
          Create a new client with an independent countdown.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onAdd();
          }}
        >
          <label className="form-label" htmlFor="client-name">
            Client Name
          </label>

          <input
            id="client-name"
            className="form-input"
            type="text"
            autoFocus
            maxLength={100}
            placeholder="Enter client name"
            value={name}
            disabled={busy}
            onChange={(event) => onNameChange(event.target.value)}
          />

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
              disabled={busy || !name.trim()}
            >
              {busy ? "Adding…" : "Add Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
