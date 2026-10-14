type DeleteClientModalProps = {
  clientName: string;
  busy?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteClientModal({
  clientName,
  busy = false,
  error,
  onConfirm,
  onCancel,
}: DeleteClientModalProps) {
  return (
    <div className="modal-backdrop">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") onCancel();
        }}
      >
        <h2 id="delete-title" className="modal-title">
          Delete Client?
        </h2>

        <p className="modal-description">
          Are you sure you want to remove <strong>{clientName}</strong>? This
          will remove the client's countdown timer.
        </p>

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
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Deleting…" : "Delete Client"}
          </button>
        </div>
      </div>
    </div>
  );
}
